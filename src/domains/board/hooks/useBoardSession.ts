import { useState, useEffect } from 'react';
import { ClassroomSession, ClassroomPrompt, ClassroomSignal } from '../../../types';

export function useBoardSession(sessionCode: string | undefined) {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [allSignals, setAllSignals] = useState<ClassroomSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async (sessionId: string, promptId?: string, phase?: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/signals`);
      if (res.ok) {
        const fetchedSignals = await res.json();
        setAllSignals(fetchedSignals);

        if (promptId) {
          setSignals(fetchedSignals.filter((s: ClassroomSignal) => s.prompt_id === promptId));
        } else if (phase) {
          setSignals(fetchedSignals.filter((s: ClassroomSignal) => s.phase === phase));
        } else {
          setSignals(fetchedSignals);
        }
      }
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    }
  };

  const fetchParticipants = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/participants`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  };

  useEffect(() => {
    if (!sessionCode) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/code/${sessionCode}`);
        if (!res.ok) throw new Error('Sessie niet gevonden');

        const data = await res.json();
        setSession(data);

        await fetchParticipants(data.id);

        const promptsRes = await fetch(`/api/sessions/${data.id}/prompts`);
        if (promptsRes.ok) {
          const prompts = await promptsRes.json();
          const active = prompts.find((p: ClassroomPrompt) => p.status === 'OPEN');

          if (active) {
            setActivePrompt(active);
            await fetchSignals(data.id, active.id, data.active_phase);
          } else {
            await fetchSignals(data.id, undefined, data.active_phase);
          }
        } else {
          await fetchSignals(data.id, undefined, data.active_phase);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fout bij laden sessie');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionCode]);

  useEffect(() => {
    if (!session) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const messageSessionId = data.session_id || data.session?.id || data.signal?.classroom_session_id || data.prompt?.classroom_session_id;

        if (messageSessionId && messageSessionId !== session.id) return;

        if (data.type === 'PHASE_CHANGED') {
          setSession(prev => prev ? { ...prev, active_phase: data.active_phase } : prev);
          setSignals([]);
          fetchSignals(session.id, activePrompt?.id, data.active_phase);
        } else if (data.type === 'PARTICIPANT_JOINED' || data.type === 'PARTICIPANT_ACCEPTED') {
          setParticipants(prev => {
            if (prev.find(p => p.id === data.participant.id)) return prev;
            return [data.participant, ...prev];
          });
        } else if (data.type === 'PARTICIPANT_UPDATED') {
          setParticipants(prev => prev.map(p => p.id === data.participant.id ? data.participant : p));
        } else if (data.type === 'PARTICIPANT_REMOVED') {
          setParticipants(prev => prev.filter(p => p.id !== data.participant_id));
        } else if (data.type === 'PROMPT_CREATED') {
          setActivePrompt(data.prompt);
          setSession(data.session);
          setSignals([]);
        } else if (data.type === 'PROMPT_CLOSED') {
          setActivePrompt(null);
          setSession(data.session);
          setSignals([]);
          fetchSignals(session.id, undefined, data.session?.active_phase || session.active_phase);
        } else if (data.type === 'SIGNAL_RECEIVED' || data.type === 'SIGNAL_CREATED') {
          const signal = data.signal as ClassroomSignal;

          setAllSignals(prev => [signal, ...prev]);

          if (activePrompt) {
            if (signal.prompt_id === activePrompt.id) {
              setSignals(prev => [signal, ...prev]);
            }
          } else if (signal.phase === session.active_phase) {
            setSignals(prev => [signal, ...prev]);
          }
        } else if (data.type === 'SESSION_UPDATED' && data.session?.id === session.id) {
          setSession(data.session);
        } else if (data.type === 'SESSION_ENDED') {
          setSession(prev => prev ? { ...prev, status: 'ENDED' } : prev);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [session?.id, session?.active_phase, activePrompt?.id]);

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