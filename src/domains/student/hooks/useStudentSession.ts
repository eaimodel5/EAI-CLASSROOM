import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassroomSession, ClassroomParticipant, ClassroomPrompt } from '../../../types';

export function useStudentSession() {
  const navigate = useNavigate();
  
  // Join Flow State
  const [sessionCode, setSessionCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Active Session State
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [participant, setParticipant] = useState<ClassroomParticipant | null>(null);
  const [activeSignal, setActiveSignal] = useState<string | null>(null);
  const [composingSignal, setComposingSignal] = useState<'HELP' | 'WORD' | 'CHECK' | null>(null);
  const [signalText, setSignalText] = useState('');
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [promptResponse, setPromptResponse] = useState('');
  const [promptSubmitted, setPromptSubmitted] = useState(false);

  useEffect(() => {
    if (!session) return;

    // Setup WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PHASE_CHANGED' && data.session_id === session.id) {
          setSession(prev => prev ? { ...prev, active_phase: data.active_phase } : prev);
          setActiveSignal(null); // Reset signal on phase change
        } else if (data.type === 'SESSION_ENDED' && data.session_id === session.id) {
          setSession(prev => prev ? { ...prev, status: 'ENDED' } : prev);
        } else if (data.type === 'PROMPT_CREATED' && data.session_id === session.id) {
          if (!data.prompt.target_participant_id || data.prompt.target_participant_id === participant?.id) {
            setActivePrompt(data.prompt);
            setPromptResponse('');
            setPromptSubmitted(false);
          }
        } else if (data.type === 'PROMPT_CLOSED' && data.session_id === session.id) {
          setActivePrompt(null);
        } else if (data.type === 'PARTICIPANT_REMOVED' && data.session_id === session.id) {
          if (participant && data.participant_id === participant.id) {
            alert('Je bent uit de sessie verwijderd door de docent.');
            navigate('/');
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
  }, [session?.id, participant?.id, navigate]);

  const joinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Bepaal het type apparaat (iPad, Mobile, of Desktop/Browser)
    let deviceType = 'browser';
    const ua = navigator.userAgent;
    if (/iPad|Macintosh/.test(ua) && 'ontouchend' in document) {
      deviceType = 'iPad';
    } else if (/Mobi|Android|iPhone/.test(ua)) {
      deviceType = 'Mobile';
    }

    try {
      const storedParticipantKey = localStorage.getItem(`participant_key_${sessionCode.toUpperCase()}`);

      const res = await fetch('/api/participants/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_code: sessionCode,
          display_name: displayName,
          device_type: deviceType,
          participant_key: storedParticipantKey // Optionally pass this to the backend so we can reconnect
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Kan niet deelnemen aan sessie');
      }
      
      const data = await res.json();
      setSession(data.session);
      setParticipant(data.participant);
      
      // Store the participant key
      if (data.participant && data.participant.participant_key) {
        localStorage.setItem(`participant_key_${sessionCode.toUpperCase()}`, data.participant.participant_key);
      }

      if (data.session.active_prompt_id) {
        const promptRes = await fetch(`/api/sessions/${data.session.id}/prompts/${data.session.active_prompt_id}`);
        if (promptRes.ok) {
          const promptData = await promptRes.json();
          if (!promptData.target_participant_id || promptData.target_participant_id === data.participant.id) {
            setActivePrompt(promptData);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const sendSignal = async (signalType: 'HELP' | 'WORD' | 'CHECK' | 'EXIT' | 'RESPONSE' | 'DRAWING', textValue?: string) => {
    if (!session || !participant) return;
    
    // Optimistic UI update
    if (signalType === 'RESPONSE') {
      setPromptSubmitted(true);
    } else if (signalType !== 'DRAWING') {
      setActiveSignal(signalType);
      setComposingSignal(null);
      setSignalText('');
    }

    try {
      if (signalType === 'WORD') {
        await fetch(`/api/sessions/${session.id}/difficult-words`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participant_id: participant.id,
            phase: session.active_phase,
            word: textValue
          })
        });
      } else {
        await fetch('/api/signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classroom_session_id: session.id,
            participant_id: participant.id,
            phase: session.active_phase,
            signal_type: signalType,
            text_value: textValue,
            prompt_id: signalType === 'RESPONSE' ? activePrompt?.id : undefined,
            urgency: signalType === 'HELP' ? 'HIGH' : 'LOW'
          })
        });
      }
    } catch (err) {
      console.error('Failed to send signal:', err);
      if (signalType === 'RESPONSE') {
        setPromptSubmitted(false);
      } else {
        setActiveSignal(null); // Revert on failure
      }
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
