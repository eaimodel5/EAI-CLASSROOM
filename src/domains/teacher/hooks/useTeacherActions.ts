import React, { useState } from 'react';
import { ClassroomSession, ClassroomParticipant, LessonPreparation } from '../../../types';
import { WidgetType, WidgetInstance } from '../../../components/widgets/WidgetRegistry';
import { PromptType, PROMPT_CONFIG } from '../types';
import { doc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';

interface UseTeacherActionsProps {
  session: ClassroomSession | null;
  setSession: (session: ClassroomSession | null) => void;
  participants: ClassroomParticipant[];
  setParticipants: React.Dispatch<React.SetStateAction<ClassroomParticipant[]>>;
  setSignals: React.Dispatch<React.SetStateAction<any[]>>;
  setSummaries: React.Dispatch<React.SetStateAction<any[]>>;
  setActivePrompt: (prompt: any) => void;
  setLoading: (loading: boolean) => void;
}

export function useTeacherActions({
  session,
  setSession,
  participants,
  setParticipants,
  setSignals,
  setSummaries,
  setActivePrompt,
  setLoading
}: UseTeacherActionsProps) {
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const generateSessionCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const startSession = async (prep: LessonPreparation) => {
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('Niet ingelogd.');
      const id = Math.random().toString(36).substring(2, 10);
      const sessionData: any = {
        id,
        teacher_user_id: auth.currentUser.uid,
        session_code: generateSessionCode(),
        subject: prep.subject || 'Onderwerp',
        grade: prep.className || '',
        level: prep.level || '',
        lesson_goal: prep.learningGoal || '',
        active_phase: 'START',
        status: 'ACTIVE',
        is_locked: 0,
        help_questions_enabled: 1,
        started_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        prep_json: JSON.stringify(prep)
      };
      
      // Store the lookup mapping for students/board
      await setDoc(doc(db, 'session_codes', sessionData.session_code), {
        sessionId: id,
        status: 'ACTIVE'
      });
      
      await setDoc(doc(db, 'classroom_sessions', id), sessionData);
      setSession(sessionData);
    } catch (err) {
      console.error(err);
      alert('Sessie kon niet worden gestart. Check je internetverbinding of ingelogde account.');
    } finally {
      setLoading(false);
    }
  };

  const updateSessionPrep = async (prep: LessonPreparation) => {
    if (!session) return;
    try {
      const updates = {
        subject: prep.subject,
        grade: prep.className,
        level: prep.level,
        lesson_goal: prep.learningGoal,
        prep_json: JSON.stringify(prep),
        updated_at: serverTimestamp()
      };
      await updateDoc(doc(db, 'classroom_sessions', session.id), updates);
      setSession({ ...session, ...updates } as any);
    } catch (err) {
      console.error(err);
    }
  };

  const changePhase = async (newPhase: "START"| "INSTRUCTIE"| "CHECK"| "VERWERKEN"| "AFSLUITING") => {
    if (!session) return;
    try {
      await updateDoc(doc(db, 'classroom_sessions', session.id), { active_phase: newPhase, updated_at: serverTimestamp() });
      setSession({ ...session, active_phase: newPhase, updated_at: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const generateTeacherProposal = async (currentSignals: any[], participants: any[], mode = 'PHASE_BRIEFING') => {
    if (!session) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/proposal`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, session, participants, signals: currentSignals })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Proposal generation error:', data);
        alert(data.error || 'Fout bij genereren van de analyse.');
      } else if (data.message) {
        alert(data.message);
      } else if (data.id) {
        try {
          await setDoc(doc(db, `classroom_sessions/${session.id}/proposals`, data.id), data);
        } catch (e) { console.warn(e); }
        // Let's store proposals in state? We need proposals state
      }
    } catch (err) {
      console.error('Network error during proposal generation:', err);
      alert('Netwerkfout bij het genereren van de analyse.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const startTeacherAction = async (action: any) => {
    if (action.action_type === 'CREATE_PROMPT') {
      await createPrompt(action.payload.prompt_type || 'CHECK_QUESTION', action.payload.prompt_text || 'Genereerde vraag');
    }
  };

  const generateSummary = async (currentSignals: any[]) => {
    if (!session) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/summarize`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session, signals: currentSignals })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Summary generation error:', data);
        alert(data.error || 'Fout bij genereren van de samenvatting.');
      } else if (data.message) {
        alert(data.message);
      } else if (data.id) {
        try {
          await setDoc(doc(db, `classroom_sessions/${session.id}/summaries`, data.id), data);
        } catch (e) { console.warn(e); }
        setSummaries(prev => {
          if (prev.find(s => s.id === data.id)) return prev;
          return [data, ...prev];
        });
      }
    } catch (err) {
      console.error('Network error during summary generation:', err);
      alert('Netwerkfout bij het genereren van de samenvatting.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const endSession = async () => {
    if (!session || !window.confirm('Weet je zeker dat je deze les wilt beëindigen?')) return false;
    try {
      await updateDoc(doc(db, 'classroom_sessions', session.id), { status: 'ENDED', ended_at: serverTimestamp(), updated_at: serverTimestamp() });
      await deleteDoc(doc(db, 'session_codes', session.session_code)).catch(() => {});
      setSession(null);
      setParticipants([]);
      setSignals([]);
      setSummaries([]);
      setActivePrompt(null);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const createPrompt = async (promptType: PromptType, newPromptText: string) => {
    if (!session || !newPromptText.trim()) return false;
    
    const config = PROMPT_CONFIG[promptType];
    const promptId = Math.random().toString(36).substring(2, 9);
    
    try {
      const promptData: any = {
        id: promptId,
        classroom_session_id: session.id,
        created_by_user_id: session.teacher_user_id,
        phase: session.active_phase,
        prompt_type: promptType,
        title: config.title,
        prompt_text: newPromptText,
        response_mode: config.responseMode,
        target_participant_id: null,
        status: 'OPEN',
        opened_at: serverTimestamp(),
        created_at: serverTimestamp()
      };
      
      await setDoc(doc(db, `classroom_sessions/${session.id}/prompts`, promptId), promptData);
      await updateDoc(doc(db, 'classroom_sessions', session.id), { active_prompt_id: promptId, updated_at: serverTimestamp() });
      return true;
    } catch (err) {
      console.error(err);
      alert('Fout bij het aanmaken van de checkvraag');
      return false;
    }
  };

  const closePrompt = async (activePromptId: string) => {
    if (!session || !activePromptId) return;
    try {
      await updateDoc(doc(db, `classroom_sessions/${session.id}/prompts`, activePromptId), { status: 'CLOSED', closed_at: serverTimestamp() });
      await updateDoc(doc(db, 'classroom_sessions', session.id), { active_prompt_id: null, updated_at: serverTimestamp() });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLock = async () => {
    if (!session) return;
    try {
      const newLockedStatus = session.is_locked ? 0 : 1;
      await updateDoc(doc(db, 'classroom_sessions', session.id), { is_locked: newLockedStatus, updated_at: serverTimestamp() });
      setSession({ ...session, is_locked: newLockedStatus });
    } catch (err) {
      console.error('Failed to toggle lock', err);
    }
  };

  const toggleHelpQuestions = async () => {
    if (!session) return;
    try {
      const currentStatus = session.help_questions_enabled === undefined ? 1 : session.help_questions_enabled;
      const newHelpStatus = currentStatus ? 0 : 1;
      await updateDoc(doc(db, 'classroom_sessions', session.id), { help_questions_enabled: newHelpStatus, updated_at: serverTimestamp() });
      setSession({ ...session, help_questions_enabled: newHelpStatus });
    } catch (err) {
      console.error('Failed to toggle help questions', err);
    }
  };

  const setTimer = async (minutes: number) => {
    if (!session) return;
    try {
      const duration = minutes === 0 ? null : minutes * 60;
      const updates: any = {};
      if (duration === null) {
        updates.timer_started_at = null;
        updates.timer_duration_seconds = null;
      } else {
        updates.timer_started_at = new Date().toISOString();
        updates.timer_duration_seconds = duration;
      }
      updates.updated_at = serverTimestamp();
      await updateDoc(doc(db, 'classroom_sessions', session.id), updates);
      setSession({ ...session, ...updates });
    } catch (err) {
      console.error('Failed to set timer', err);
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!session || !window.confirm('Weet je zeker dat je deze leerling wilt verwijderen?')) return;
    try {
      await deleteDoc(doc(db, `classroom_sessions/${session.id}/participants`, participantId));
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    } catch (err) {
      console.error('Failed to remove participant', err);
    }
  };

  const updateParticipant = async (participantId: string, updates: { display_name?: string, timeout_until?: string | null, can_draw?: boolean, team_name?: string | null }) => {
    if (!session) return;
    try {
      await updateDoc(doc(db, `classroom_sessions/${session.id}/participants`, participantId), updates);
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, ...updates } : p));
    } catch (err) {
      console.error('Failed to update participant', err);
    }
  };

  const sendPrivateMessage = async (participantId: string, message: string) => {
    if (!session) return;
    const promptId = Math.random().toString(36).substring(2, 9);
    try {
      await setDoc(doc(db, `classroom_sessions/${session.id}/prompts`, promptId), {
        id: promptId,
        classroom_session_id: session.id,
        created_by_user_id: session.teacher_user_id,
        phase: session.active_phase,
        prompt_type: 'HINT',
        title: 'Direct Message',
        prompt_text: message,
        response_mode: 'ACKNOWLEDGE',
        target_participant_id: participantId,
        status: 'OPEN',
        opened_at: serverTimestamp(),
        created_at: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to send private message', err);
    }
  };

  const pickRandomName = async () => {
    if (!session || participants.length === 0) {
      alert('Er zijn geen leerlingen om uit te kiezen.');
      return;
    }
    const randomStudent = participants[Math.floor(Math.random() * participants.length)];
    const promptId = Math.random().toString(36).substring(2, 9);
    
    try {
      await setDoc(doc(db, `classroom_sessions/${session.id}/prompts`, promptId), {
        id: promptId,
        classroom_session_id: session.id,
        created_by_user_id: session.teacher_user_id,
        phase: session.active_phase,
        prompt_type: 'WHEEL_OF_NAMES',
        title: PROMPT_CONFIG.WHEEL_OF_NAMES.title,
        prompt_text: `${randomStudent.display_name} is aan de beurt!`,
        response_mode: PROMPT_CONFIG.WHEEL_OF_NAMES.responseMode,
        target_participant_id: null,
        status: 'OPEN',
        opened_at: serverTimestamp(),
        created_at: serverTimestamp()
      });
      await updateDoc(doc(db, 'classroom_sessions', session.id), { active_prompt_id: promptId, updated_at: serverTimestamp() });
    } catch (err) {
      console.error(err);
      alert('Fout bij het kiezen van een willekeurige leerling');
    }
  };

  const shareSignal = async (signalId: string | null) => {
    if (!session) return;
    try {
      await updateDoc(doc(db, 'classroom_sessions', session.id), { shared_signal_id: signalId, updated_at: serverTimestamp() });
      setSession({ ...session, shared_signal_id: signalId });
    } catch (err) {
      console.error('Failed to share signal', err);
    }
  };

  const handleAddWidget = async (type: WidgetType) => {
    if (!session) return false;
    const currentWidgets: WidgetInstance[] = JSON.parse(session.widgets_json || '[]');
    const newWidget: WidgetInstance = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      x: 10 + (currentWidgets.length * 5),
      y: 10 + (currentWidgets.length * 5),
      w: 20,
      h: 30,
      data: type === 'LESSON_PLAN' ? { prep: JSON.parse(session.prep_json || '{}') } : {}
    };
    
    const updatedWidgets = [...currentWidgets, newWidget];
    const widgetsJson = JSON.stringify(updatedWidgets);
    
    try {
      await updateDoc(doc(db, 'classroom_sessions', session.id), { widgets_json: widgetsJson, updated_at: serverTimestamp() });
      setSession({ ...session, widgets_json: widgetsJson });
      return true;
    } catch (e) {
      console.error('Failed to add widget', e);
      return false;
    }
  };

  const handleRemoveWidget = async (id: string) => {
    if (!session) return;
    const currentWidgets: WidgetInstance[] = JSON.parse(session.widgets_json || '[]');
    const updatedWidgets = currentWidgets.filter(w => w.id !== id);
    const widgetsJson = JSON.stringify(updatedWidgets);
    
    try {
      await updateDoc(doc(db, 'classroom_sessions', session.id), { widgets_json: widgetsJson, updated_at: serverTimestamp() });
      setSession({ ...session, widgets_json: widgetsJson });
    } catch (e) {
      console.error('Failed to remove widget', e);
    }
  };

  const handleUpdateWidget = async (id: string, updates: Partial<WidgetInstance>) => {
    if (!session) return;
    const currentWidgets: WidgetInstance[] = JSON.parse(session.widgets_json || '[]');
    const updatedWidgets = currentWidgets.map(w => w.id === id ? { ...w, ...updates } : w);
    const widgetsJson = JSON.stringify(updatedWidgets);
    
    try {
      await updateDoc(doc(db, 'classroom_sessions', session.id), { widgets_json: widgetsJson, updated_at: serverTimestamp() });
      setSession({ ...session, widgets_json: widgetsJson });
    } catch (e) {
      console.error('Failed to update widget', e);
    }
  };

  return {
    generatingSummary,
    startSession,
    updateSessionPrep,
    changePhase,
    generateSummary,
    generateTeacherProposal,
    startTeacherAction,
    endSession,
    createPrompt,
    closePrompt,
    toggleLock,
    toggleHelpQuestions,
    setTimer,
    removeParticipant,
    updateParticipant,
    sendPrivateMessage,
    pickRandomName,
    shareSignal,
    handleAddWidget,
    handleRemoveWidget,
    handleUpdateWidget
  };
}
