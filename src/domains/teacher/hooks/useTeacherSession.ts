import { useState, useEffect } from 'react';
import { ClassroomSession, ClassroomParticipant, ClassroomSignal, ClassroomSummary, ClassroomPrompt } from '../../../types';

export function useTeacherSession() {
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [summaries, setSummaries] = useState<ClassroomSummary[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      try {
        const [pRes, sRes, sumRes] = await Promise.all([
          fetch(`/api/sessions/${session.id}/participants`),
          fetch(`/api/sessions/${session.id}/signals`),
          fetch(`/api/sessions/${session.id}/summaries`)
        ]);
        if (pRes.ok) setParticipants(await pRes.json());
        if (sRes.ok) setSignals(await sRes.json());
        if (sumRes.ok) setSummaries(await sumRes.json());
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      }
    };
    fetchData();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WS message received:', data);
        if (data.session_id !== session.id) return;

        if (data.type === 'PARTICIPANT_JOINED') {
          setParticipants(prev => {
            if (prev.find(p => p.id === data.participant.id)) return prev;
            return [...prev, data.participant];
          });
        } else if (data.type === 'SIGNAL_RECEIVED') {
          setSignals(prev => [data.signal, ...prev]);
        } else if (data.type === 'SUMMARY_GENERATED') {
          setSummaries(prev => [data.summary, ...prev]);
        } else if (data.type === 'PROMPT_CREATED') {
          setActivePrompt(data.prompt);
          setSession(data.session);
        } else if (data.type === 'PROMPT_CLOSED') {
          setActivePrompt(null);
          setSession(data.session);
        } else if (data.type === 'SESSION_UPDATED' && data.session.id === session.id) {
          setSession(data.session);
        } else if (data.type === 'PARTICIPANT_REMOVED' && data.session_id === session.id) {
          setParticipants(prev => prev.filter(p => p.id !== data.participant_id));
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => ws.close();
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
