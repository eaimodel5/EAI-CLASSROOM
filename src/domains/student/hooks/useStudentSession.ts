import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassroomSession, ClassroomParticipant, ClassroomPrompt } from '../../../types';
import { db, auth } from '../../../lib/firebase';
import { doc, collection, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../../lib/firebase-error';

export function useStudentSession() {
  const navigate = useNavigate();
  
  const [sessionCode, setSessionCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participant, setParticipant] = useState<ClassroomParticipant | null>(null);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [composingSignal, setComposingSignal] = useState<'HELP' | 'WORD' | 'CHECK' | null>(null);
  const [signalText, setSignalText] = useState('');
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [promptResponse, setPromptResponse] = useState('');
  const [promptSubmitted, setPromptSubmitted] = useState(false);

  useEffect(() => {
    if (!session?.id || !participant?.id) return;

    const unsubSession = onSnapshot(doc(db, 'classroom_sessions', session.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ClassroomSession;
        if (session && data.active_phase !== session.active_phase) {
          setActiveSignal(null);
        }
        if (data.status === 'ENDED') {
          navigate('/');
        }
        setSession({ ...data, id: docSnap.id });
      } else {
        navigate('/');
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'classroom_sessions'));

    const unsubParticipant = onSnapshot(doc(db, `classroom_sessions/${session.id}/participants`, participant.id), (docSnap) => {
      if (!docSnap.exists()) {
        alert('Je bent uit de sessie verwijderd door de docent.');
        navigate('/');
      }
    });

    const unsubPrompts = onSnapshot(collection(db, `classroom_sessions/${session.id}/prompts`), (snap) => {
      let active: ClassroomPrompt | null = null;
      snap.forEach(d => {
        const p = { ...d.data(), id: d.id } as ClassroomPrompt;
        if (p.status === 'OPEN' && (!p.target_participant_id || p.target_participant_id === participant.id)) {
          active = p;
        }
      });
      if (active && (!activePrompt || activePrompt.id !== active.id)) {
         setActivePrompt(active);
         setPromptResponse('');
         setPromptSubmitted(false);
      } else if (!active) {
         setActivePrompt(null);
      }
    });

    return () => { unsubSession(); unsubParticipant(); unsubPrompts(); };
  }, [session?.id, participant?.id, navigate]);

  const joinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let deviceType = 'browser';
    const ua = navigator.userAgent;
    if (/iPad|Macintosh/.test(ua) && 'ontouchend' in document) deviceType = 'iPad';
    else if (/Mobi|Android|iPhone/.test(ua)) deviceType = 'Mobile';

    try {
      if (!auth.currentUser) throw new Error("Authentication failed");
      const localCode = sessionCode.toUpperCase();
      
      const res = await fetch(`/api/sessions/code/${localCode}`);
      if (!res.ok) throw new Error('Sessie niet gevonden');
      const sessionData = await res.json();
      
      const pId = Math.random().toString(36).substring(2, 9);
      const participantRef = doc(db, `classroom_sessions/${sessionData.id}/participants`, pId);
      
      const newParticipant = {
        classroom_session_id: sessionData.id,
        student_user_id: auth.currentUser.uid,
        display_name: displayName,
        participant_key: pId,
        join_status: 'JOINED',
        device_type: deviceType,
        joined_at: serverTimestamp()
      };
      
      await setDoc(participantRef, newParticipant);
      
      setSession(sessionData);
      setParticipant({ ...newParticipant, id: pId } as ClassroomParticipant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const sendSignal = async (signalType: 'HELP' | 'WORD' | 'CHECK' | 'EXIT' | 'RESPONSE' | 'DRAWING', textValue?: string) => {
    if (!session || !participant) return;
    
    if (signalType === 'RESPONSE') setPromptSubmitted(true);
    else if (signalType !== 'DRAWING') { setActiveSignal(signalType); setComposingSignal(null); setSignalText(''); }

    try {
      const sigId = Math.random().toString(36).substring(2, 9);
      await setDoc(doc(db, `classroom_sessions/${session.id}/signals`, sigId), {
        classroom_session_id: session.id,
        participant_id: participant.id,
        phase: session.active_phase,
        signal_type: signalType,
        text_value: textValue || null,
        prompt_id: signalType === 'RESPONSE' ? activePrompt?.id : null,
        urgency: signalType === 'HELP' ? 'HIGH' : 'LOW',
        status: 'NEW',
        created_at: serverTimestamp()
      });
      // also ping the backend just in case for older parts
      if (signalType === 'WORD') {
         fetch(`/api/sessions/${session.id}/word`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participant_id: participant.id, phase: session.active_phase, word: textValue })
        }).catch(e => console.error(e));
      }
    } catch (err) {
      console.error('Failed to send signal:', err);
      if (signalType === 'RESPONSE') setPromptSubmitted(false);
      else setActiveSignal(null);
    }
  };

  return {
    sessionCode, setSessionCode,
    displayName, setDisplayName,
    loading, error,
    session, participant,
    activeSignal, setActiveSignal,
    composingSignal, setComposingSignal,
    signalText, setSignalText,
    activePrompt, promptResponse, setPromptResponse,
    promptSubmitted,
    joinSession, sendSignal
  };
}
