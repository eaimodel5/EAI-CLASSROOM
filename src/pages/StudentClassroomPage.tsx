import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, CheckCircle, LogOut, ArrowLeft } from 'lucide-react';
import { ClassroomSession, ClassroomParticipant, ClassroomPrompt } from '../types';
import { useNavigate } from 'react-router-dom';

export default function StudentClassroomPage() {
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
          setActivePrompt(data.prompt);
          setPromptResponse('');
          setPromptSubmitted(false);
        } else if (data.type === 'PROMPT_CLOSED' && data.session_id === session.id) {
          setActivePrompt(null);
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [session?.id]);

  const joinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/participants/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_code: sessionCode,
          display_name: displayName,
          device_type: 'browser'
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Kan niet deelnemen aan sessie');
      }
      
      const data = await res.json();
      setSession(data.session);
      setParticipant(data.participant);

      if (data.session.active_prompt_id) {
        const promptRes = await fetch(`/api/sessions/${data.session.id}/prompts/${data.session.active_prompt_id}`);
        if (promptRes.ok) {
          setActivePrompt(await promptRes.json());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const sendSignal = async (signalType: 'HELP' | 'WORD' | 'CHECK' | 'EXIT' | 'RESPONSE', textValue?: string) => {
    if (!session || !participant) return;
    
    // Optimistic UI update
    if (signalType === 'RESPONSE') {
      setPromptSubmitted(true);
    } else {
      setActiveSignal(signalType);
      setComposingSignal(null);
      setSignalText('');
    }

    try {
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
    } catch (err) {
      console.error('Failed to send signal:', err);
      if (signalType === 'RESPONSE') {
        setPromptSubmitted(false);
      } else {
        setActiveSignal(null); // Revert on failure
      }
    }
  };

  // --- JOIN FLOW UI ---
  if (!session || !participant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mb-4">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Terug naar start
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Deelnemen aan les</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={joinSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lescode</label>
              <input 
                required
                type="text" 
                value={sessionCode}
                onChange={e => setSessionCode(e.target.value.toUpperCase())}
                placeholder="bijv. X7K9M2"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jouw naam (of alias)</label>
              <input 
                required
                type="text" 
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Hoe heet je?"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || sessionCode.length < 6 || !displayName}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? 'Bezig met verbinden...' : 'Doe mee'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- ACTIVE SESSION UI ---
  
  // Determine background color based on active phase
  const getPhaseStyles = () => {
    switch (session.active_phase) {
      case 'START': return 'bg-blue-50';
      case 'INSTRUCTION': return 'bg-amber-50';
      case 'PRACTICE': return 'bg-emerald-50';
      case 'CLOSING': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const getPhaseTitle = () => {
    switch (session.active_phase) {
      case 'START': return 'Start & Doel';
      case 'INSTRUCTION': return 'Instructie';
      case 'PRACTICE': return 'Zelfstandig Werken';
      case 'CLOSING': return 'Afsluiting';
      default: return '';
    }
  };

  if (session.status === 'ENDED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Les is afgelopen</h1>
          <p className="text-gray-600 mb-6">De docent heeft deze sessie beëindigd.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Terug naar start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${getPhaseStyles()}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{session.subject}</div>
          <div className="font-bold text-gray-900">{getPhaseTitle()}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
            {participant.display_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content: Signal Buttons */}
      <main className="flex-1 p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-4">
        
        {activePrompt ? (
          <div className={`p-6 rounded-2xl shadow-sm border-2 w-full animate-in fade-in slide-in-from-bottom-4 ${
            activePrompt.prompt_type === 'HINT' ? 'bg-amber-50 border-amber-200' :
            activePrompt.prompt_type === 'REFLECTION' ? 'bg-emerald-50 border-emerald-200' :
            'bg-white border-indigo-200'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              activePrompt.prompt_type === 'HINT' ? 'text-amber-600' :
              activePrompt.prompt_type === 'REFLECTION' ? 'text-emerald-600' :
              'text-indigo-600'
            }`}>
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold uppercase tracking-wider text-xs">
                {activePrompt.prompt_type === 'HINT' ? 'Hint van de docent' :
                 activePrompt.prompt_type === 'REFLECTION' ? 'Reflectievraag' :
                 'Vraag van de docent'}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {activePrompt.prompt_text}
            </h2>
            
            {activePrompt.response_mode === 'ACKNOWLEDGE' ? (
              <div className="flex justify-center mt-6">
                {promptSubmitted ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 w-full">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-medium">Gelezen!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => sendSignal('RESPONSE', 'Gelezen')}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Ik heb dit gelezen
                  </button>
                )}
              </div>
            ) : promptSubmitted ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Jouw antwoord is verzonden! Wacht op de docent.</span>
              </div>
            ) : (
              <>
                <textarea
                  value={promptResponse}
                  onChange={(e) => setPromptResponse(e.target.value)}
                  placeholder="Typ hier je antwoord..."
                  className="w-full p-3 border rounded-lg mb-4 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  autoFocus
                />
                <button
                  onClick={() => sendSignal('RESPONSE', promptResponse)}
                  disabled={!promptResponse.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Verstuur Antwoord
                </button>
              </>
            )}
          </div>
        ) : composingSignal ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm border w-full animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {composingSignal === 'WORD' ? 'Welk woord begrijp je niet?' : 'Waar loop je precies vast?'}
            </h2>
            <textarea
              value={signalText}
              onChange={(e) => setSignalText(e.target.value)}
              placeholder={composingSignal === 'WORD' ? 'Typ het woord hier...' : 'Optioneel: leg kort uit wat je niet snapt...'}
              className="w-full p-3 border rounded-lg mb-4 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setComposingSignal(null);
                  setSignalText('');
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => sendSignal(composingSignal, signalText)}
                disabled={composingSignal === 'WORD' && !signalText.trim()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                Versturen
              </button>
            </div>
          </div>
        ) : activeSignal ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Verzonden!</h2>
            <p className="text-gray-600 mb-6">De docent heeft je bericht ontvangen.</p>
            <button
              onClick={() => setActiveSignal(null)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Terug naar opties
            </button>
          </div>
        ) : (
          <>
            {/* Only show relevant buttons based on phase */}
            {session.active_phase === 'INSTRUCTION' && (
              <>
                <button 
                  onClick={() => setComposingSignal('HELP')}
                  className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 active:scale-95"
                >
                  <HelpCircle className="w-10 h-10 text-gray-400" />
                  <span className="font-bold text-lg">Ik snap het niet</span>
                </button>
                
                <button 
                  onClick={() => setComposingSignal('WORD')}
                  className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50 active:scale-95"
                >
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                  <span className="font-bold text-lg">Wat betekent dit woord?</span>
                </button>
              </>
            )}

            {session.active_phase === 'PRACTICE' && (
              <>
                <button 
                  onClick={() => setComposingSignal('HELP')}
                  className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 active:scale-95"
                >
                  <HelpCircle className="w-10 h-10 text-gray-400" />
                  <span className="font-bold text-lg">Ik loop vast</span>
                </button>

                <button 
                  onClick={() => sendSignal('CHECK')}
                  className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 active:scale-95"
                >
                  <CheckCircle className="w-10 h-10 text-gray-400" />
                  <span className="font-bold text-lg">Ik ben klaar</span>
                </button>
              </>
            )}

            {(session.active_phase === 'START' || session.active_phase === 'CLOSING') && (
              <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-black/5">
                <p className="text-lg font-medium text-gray-600">
                  {session.active_phase === 'START' ? 'Kijk naar het bord voor de start van de les.' : 'De les is afgelopen. Kijk naar het bord.'}
                </p>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
