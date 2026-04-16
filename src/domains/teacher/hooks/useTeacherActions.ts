import { useState } from 'react';
import { ClassroomSession, ClassroomParticipant, LessonPreparation } from '../../../types';
import { WidgetType, WidgetInstance } from '../../../components/widgets/WidgetRegistry';
import { PromptType, PROMPT_CONFIG } from '../types';

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

  const startSession = async (prep: LessonPreparation) => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_user_id: 'teacher-demo-1', // Hardcoded for MVP
          subject: prep.subject,
          grade: prep.className,
          level: prep.level,
          lesson_goal: prep.learningGoal,
          prep_json: JSON.stringify(prep)
        })
      });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changePhase = async (newPhase: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.id}/phase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active_phase: newPhase })
      });
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateSummary = async () => {
    if (!session) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/summarize`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        console.error('Summary generation error:', data);
        alert(data.error || 'Fout bij genereren van de samenvatting.');
      } else if (data.message) {
        alert(data.message);
      } else if (data.id) {
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
      await fetch(`/api/sessions/${session.id}/end`, { method: 'PUT' });
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
    
    try {
      await fetch(`/api/sessions/${session.id}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: config.title,
          prompt_text: newPromptText,
          prompt_type: promptType,
          response_mode: config.responseMode
        })
      });
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
      await fetch(`/api/sessions/${session.id}/prompts/${activePromptId}/close`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLock = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.id}/lock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_locked: !session.is_locked })
      });
      if (res.ok) {
        setSession(await res.json());
      }
    } catch (err) {
      console.error('Failed to toggle lock', err);
    }
  };

  const setTimer = async (minutes: number) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.id}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_seconds: minutes === 0 ? null : minutes * 60 })
      });
      if (res.ok) {
        setSession(await res.json());
      }
    } catch (err) {
      console.error('Failed to set timer', err);
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!session || !window.confirm('Weet je zeker dat je deze leerling wilt verwijderen?')) return;
    try {
      const res = await fetch(`/api/sessions/${session.id}/participants/${participantId}`, { method: 'DELETE' });
      if (res.ok) {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      }
    } catch (err) {
      console.error('Failed to remove participant', err);
    }
  };

  const pickRandomName = async () => {
    if (!session || participants.length === 0) {
      alert('Er zijn geen leerlingen om uit te kiezen.');
      return;
    }
    const randomStudent = participants[Math.floor(Math.random() * participants.length)];
    
    try {
      await fetch(`/api/sessions/${session.id}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: PROMPT_CONFIG.WHEEL_OF_NAMES.title,
          prompt_text: `${randomStudent.display_name} is aan de beurt!`,
          prompt_type: 'WHEEL_OF_NAMES',
          response_mode: PROMPT_CONFIG.WHEEL_OF_NAMES.responseMode
        })
      });
    } catch (err) {
      console.error(err);
      alert('Fout bij het kiezen van een willekeurige leerling');
    }
  };

  const shareSignal = async (signalId: string | null) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/sessions/${session.id}/share-signal`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shared_signal_id: signalId })
      });
      if (res.ok) {
        setSession(await res.json());
      }
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
      await fetch(`/api/sessions/${session.id}/widgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets_json: widgetsJson })
      });
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
      await fetch(`/api/sessions/${session.id}/widgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets_json: widgetsJson })
      });
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
      await fetch(`/api/sessions/${session.id}/widgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets_json: widgetsJson })
      });
      setSession({ ...session, widgets_json: widgetsJson });
    } catch (e) {
      console.error('Failed to update widget', e);
    }
  };

  return {
    generatingSummary,
    startSession,
    changePhase,
    generateSummary,
    endSession,
    createPrompt,
    closePrompt,
    toggleLock,
    setTimer,
    removeParticipant,
    pickRandomName,
    shareSignal,
    handleAddWidget,
    handleRemoveWidget,
    handleUpdateWidget
  };
}
