import { useState, useEffect } from 'react';
import { ClassroomSession, ClassroomParticipant, ClassroomSignal, ClassroomSummary, ClassroomPrompt, TeacherProposal } from '../../../types';
import { db, auth } from '../../../lib/firebase';
import { doc, collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../../lib/firebase-error';

export function useTeacherSession() {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [summaries, setSummaries] = useState<ClassroomSummary[]>([]);
  const [proposals, setProposals] = useState<TeacherProposal[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load existing session on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        if (!auth.currentUser) return;
        const q = query(
          collection(db, 'classroom_sessions'),
          where('teacher_user_id', '==', auth.currentUser.uid),
          where('status', '==', 'ACTIVE')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          setSession({ ...docSnap.data(), id: docSnap.id } as ClassroomSession);
        }
      } catch (err) {
        console.error('Failed to load active session:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadActiveSession();
  }, []);

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

    const qProposals = query(collection(db, `classroom_sessions/${session.id}/proposals`), orderBy('created_at', 'desc'));
    const unsubProposals = onSnapshot(qProposals, (snap) => {
      const props: TeacherProposal[] = [];
      snap.forEach(d => props.push({ ...d.data(), id: d.id } as TeacherProposal));
      setProposals(props);
    }, (error) => handleFirestoreError(error, OperationType.GET, `classroom_sessions/${session.id}/proposals`));

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
      unsubProposals();
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
    proposals,
    setProposals,
    activePrompt,
    setActivePrompt,
    loading,
    setLoading,
    initialLoading
  };
}
