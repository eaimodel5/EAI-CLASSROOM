import { useState, useEffect } from 'react';
import { ClassroomSession, ClassroomPrompt, ClassroomSignal } from '../../../types';

export function useBoardSession(sessionCode: string | undefined) {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [allSignals, setAllSignals] = useState<ClassroomSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async (sessionId: string, promptId?: string) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/signals`);
      if (res.ok) {
        const fetchedSignals = await res.json();
        setAllSignals(fetchedSignals);
        if (promptId) {
          setSignals(fetchedSignals.filter((s: ClassroomSignal) => s.prompt_id === promptId));
        } else {
          setSignals(fetchedSignals.filter((s: ClassroomSignal) => s.phase === session?.active_phase));
        }
      }
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    }
  };

  useEffect(() => {
    if (!sessionCode) return;
    
    // 1. Initial fetch of session data by code
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/code/${sessionCode}`);
        if (!res.ok) throw new Error('Sessie niet gevonden');
        const data = await res.json();
        setSession(data);
        
        // Fetch active prompt
        const promptsRes = await fetch(`/api/sessions/${data.id}/prompts`);
        if (promptsRes.ok) {
          const prompts = await promptsRes.json();
          const active = prompts.find((p: ClassroomPrompt) => p.status === 'OPEN');
          if (active) {
            setActivePrompt(active);
            fetchSignals(data.id, active.id);
          }
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
    if (session && !activePrompt) {
      fetchSignals(session.id);
    }
  }, [session?.active_phase, activePrompt]);

  useEffect(() => {
    if (!session) return;

    // 2. Setup WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id !== session.id) return;

        if (data.type === 'PHASE_CHANGED') {
          setSession(prev => prev ? { ...prev, active_phase: data.active_phase } : prev);
        } else if (data.type === 'PROMPT_CREATED') {
          setActivePrompt(data.prompt);
          setSignals([]);
        } else if (data.type === 'PROMPT_CLOSED') {
          setActivePrompt(null);
          setSignals([]);
        } else if (data.type === 'SIGNAL_CREATED') {
          setAllSignals(prev => [data.signal, ...prev]);
          if (activePrompt) {
            if (data.signal.prompt_id === activePrompt.id) {
              setSignals(prev => [data.signal, ...prev]);
            }
          } else if (data.signal.phase === session.active_phase) {
            setSignals(prev => [data.signal, ...prev]);
          }
        } else if (data.type === 'SESSION_UPDATED' && data.session.id === session.id) {
          setSession(data.session);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [session?.id, activePrompt?.id]);

  return {
    session,
    activePrompt,
    signals,
    allSignals,
    loading,
    error
  };
}
