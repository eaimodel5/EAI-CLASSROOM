import { useState, useEffect } from 'react';
import { ClassroomSession, ClassroomPrompt, ClassroomSignal, ClassroomParticipant } from '../../../types';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, doc, getDocs } from 'firebase/firestore';

export function useBoardSession(sessionCode: string | undefined) {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [allSignals, setAllSignals] = useState<ClassroomSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionCode) return;

    let unsubSession: () => void;
    let unsubParticipants: () => void;
    let unsubAllSignals: () => void;
    let unsubPrompts: () => void;

    const initializeSession = async () => {
      try {
        const uppercaseCode = sessionCode.toUpperCase();
        // Since board doesn't know sessionId initially, query by sessionCode
        const sessionsRef = collection(db, 'classroom_sessions');
        const qSession = query(sessionsRef, where('session_code', '==', uppercaseCode));
        const sessionSnap = await getDocs(qSession);
        
        if (sessionSnap.empty) {
          throw new Error('Sessie niet gevonden');
        }

        const sessionDoc = sessionSnap.docs[0];
        const sessionId = sessionDoc.id;

        // Monitor session
        unsubSession = onSnapshot(doc(db, 'classroom_sessions', sessionId), (docSnap) => {
          if (docSnap.exists()) {
            setSession({ ...docSnap.data(), id: docSnap.id } as ClassroomSession);
          } else {
            setError('Sessie is beëindigd of verwijderd');
          }
        });

        // Monitor participants
        unsubParticipants = onSnapshot(collection(db, `classroom_sessions/${sessionId}/participants`), (snap) => {
          const parts: ClassroomParticipant[] = [];
          snap.forEach(d => parts.push({ ...d.data(), id: d.id } as ClassroomParticipant));
          setParticipants(parts);
        });

        // Monitor all signals (we filter in render/state)
        unsubAllSignals = onSnapshot(collection(db, `classroom_sessions/${sessionId}/signals`), (snap) => {
          const sigs: ClassroomSignal[] = [];
          snap.forEach(d => sigs.push({ ...d.data(), id: d.id } as ClassroomSignal));
          // Sort descending by created_at artificially if needed, but array order is fine usually
          setAllSignals(sigs);
        });

        // Monitor prompts for active one
        unsubPrompts = onSnapshot(collection(db, `classroom_sessions/${sessionId}/prompts`), (snap) => {
          const prompts: ClassroomPrompt[] = [];
          snap.forEach(d => prompts.push({ ...d.data(), id: d.id } as ClassroomPrompt));
          const active = prompts.find(p => p.status === 'OPEN');
          setActivePrompt(active || null);
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fout bij laden sessie');
        setLoading(false);
      }
    };

    initializeSession();

    return () => {
      if (unsubSession) unsubSession();
      if (unsubParticipants) unsubParticipants();
      if (unsubAllSignals) unsubAllSignals();
      if (unsubPrompts) unsubPrompts();
    };
  }, [sessionCode]);

  // Derived state for filtered signals based on current phase or active prompt
  useEffect(() => {
    if (!session) return;
    
    if (activePrompt) {
      setSignals(allSignals.filter(s => s.prompt_id === activePrompt.id));
    } else {
      setSignals(allSignals.filter(s => s.phase === session.active_phase));
    }
  }, [allSignals, activePrompt, session?.active_phase]);

  return {
    session,
    participants,
    activePrompt,
    signals,
    allSignals,
    loading,
    error
  };
}