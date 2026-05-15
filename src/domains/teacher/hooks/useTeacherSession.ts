import { useState, useEffect } from 'react';
import { ClassroomSession, ClassroomParticipant, ClassroomSignal, ClassroomSummary, ClassroomPrompt } from '../../../types';
import { db, auth } from '../../../lib/firebase';
import { doc, collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../../lib/firebase-error';

export function useTeacherSession() {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [summaries, setSummaries] = useState<ClassroomSummary[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.id) return;

    const unsubSession = onSnapshot(doc(db, 'classroom_sessions', session.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ClassroomSession;
        setSession({ ...data, id: docSnap.id });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `classroom_sessions/${session.id}`));

    const unsubParticipants = onSnapshot(collection(db, `classroom_sessions/${session.id}/participants`), (snap) => {
      const parts: ClassroomParticipant[] = [];
      snap.forEach(d => parts.push({ ...d.data(), id: d.id } as ClassroomParticipant));
      setParticipants(parts);
    }, (error) => handleFirestoreError(error, OperationType.GET, `classroom_sessions/${session.id}/participants`));

    const qSignals = query(collection(db, `classroom_sessions/${session.id}/signals`), orderBy('created_at', 'desc'));
    const unsubSignals = onSnapshot(qSignals, (snap) => {
      const sigs: ClassroomSignal[] = [];
      snap.forEach(d => sigs.push({ ...d.data(), id: d.id } as ClassroomSignal));
      setSignals(sigs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `classroom_sessions/${session.id}/signals`));

    const qSummaries = query(collection(db, `classroom_sessions/${session.id}/summaries`), orderBy('created_at', 'desc'));
    const unsubSummaries = onSnapshot(qSummaries, (snap) => {
      const sums: ClassroomSummary[] = [];
      snap.forEach(d => sums.push({ ...d.data(), id: d.id } as ClassroomSummary));
      setSummaries(sums);
    }, (error) => handleFirestoreError(error, OperationType.GET, `classroom_sessions/${session.id}/summaries`));

    const qPrompts = query(collection(db, `classroom_sessions/${session.id}/prompts`));
    const unsubPrompts = onSnapshot(qPrompts, (snap) => {
      const prompts: ClassroomPrompt[] = [];
      snap.forEach(d => prompts.push({ ...d.data(), id: d.id } as ClassroomPrompt));
      const active = prompts.find(p => p.status === 'OPEN');
      setActivePrompt(active || null);
    }, (error) => handleFirestoreError(error, OperationType.GET, `classroom_sessions/${session.id}/prompts`));

    return () => {
      unsubSession();
      unsubParticipants();
      unsubSignals();
      unsubSummaries();
      unsubPrompts();
    };
  }, [session?.id]);

  return {
    session,
    setSession,
    participants,
    setParticipants,
    signals,
    setSignals,
    summaries,
    setSummaries,
    activePrompt,
    setActivePrompt,
    loading,
    setLoading
  };
}
