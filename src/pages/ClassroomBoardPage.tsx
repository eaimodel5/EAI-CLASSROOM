import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClassroomSession, ClassroomPrompt, ClassroomSignal } from '../types';
import { CheckCircle2, HelpCircle, MessageSquare, Sparkles, Clock } from 'lucide-react';
import { WidgetRenderer } from '../components/widgets/WidgetRenderer';
import { WidgetInstance } from '../components/widgets/WidgetRegistry';

function TimerDisplay({ session }: { session: ClassroomSession }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!session.timer_started_at || !session.timer_duration_seconds) {
      setTimeLeft(null);
      return;
    }

    const endTime = new Date(session.timer_started_at).getTime() + session.timer_duration_seconds * 1000;
    
    const updateTimer = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session.timer_started_at, session.timer_duration_seconds]);

  if (timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isWarning = timeLeft > 0 && timeLeft <= 60000; // Last minute warning
  const isEnded = timeLeft === 0;

  return (
    <div className={`flex items-center gap-4 px-8 py-4 rounded-3xl font-mono font-bold text-6xl shadow-lg border-4 ${
      isEnded ? 'bg-red-100 text-red-700 border-red-200' :
      isWarning ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' :
      'bg-white text-gray-800 border-gray-200'
    }`}>
      <Clock className={`w-12 h-12 ${isEnded ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-500'}`} />
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}

export default function ClassroomBoardPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [allSignals, setAllSignals] = useState<ClassroomSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Laden...</div>;
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oeps!</h1>
          <p className="text-xl text-gray-600">{error || 'Sessie niet gevonden'}</p>
        </div>
      </div>
    );
  }

  // Determine background color based on active phase
  const getPhaseStyles = () => {
    switch (session.active_phase) {
      case 'START': return 'bg-blue-50 text-blue-900';
      case 'INSTRUCTIE': return 'bg-amber-50 text-amber-900';
      case 'CHECK': return 'bg-orange-50 text-orange-900';
      case 'VERWERKEN': return 'bg-emerald-50 text-emerald-900';
      case 'AFSLUITING': return 'bg-purple-50 text-purple-900';
      default: return 'bg-gray-50 text-gray-900';
    }
  };

  const getPhaseTitle = () => {
    switch (session.active_phase) {
      case 'START': return 'Welkom';
      case 'INSTRUCTIE': return 'Instructie';
      case 'CHECK': return 'Check van Begrip';
      case 'VERWERKEN': return 'Zelfstandig Werken';
      case 'AFSLUITING': return 'Afsluiting';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${getPhaseStyles()}`}>
      {/* Top Bar: Code & Subject */}
      <header className="p-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-medium opacity-80">{session.subject} {session.grade}</h2>
          <h1 className="text-5xl font-bold mt-2 tracking-tight">{getPhaseTitle()}</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <TimerDisplay session={session} />
          <div className="bg-white/60 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-sm border border-black/5 text-center">
            <div className="text-sm font-semibold uppercase tracking-widest opacity-60 mb-2">Doe mee via EAIHUB</div>
            <div className="text-6xl font-mono font-black tracking-widest">{session.session_code}</div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Goal & Context */}
      <main className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-5xl mx-auto w-full relative">
        {/* Widgets Overlay (Board View) */}
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {JSON.parse(session.widgets_json || '[]').map((widget: WidgetInstance) => (
            <div key={widget.id} className="pointer-events-auto absolute" style={{ width: '100%', height: '100%' }}>
              <WidgetRenderer 
                widget={widget} 
                isTeacher={false} 
              />
            </div>
          ))}
        </div>

        {activePrompt ? (
          <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[3rem] shadow-xl border border-black/5 w-full max-w-4xl animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-center gap-4 mb-8 text-indigo-600">
              {['HINT', 'CONFIDENCE'].includes(activePrompt.prompt_type) ? (
                <Sparkles className="w-12 h-12" />
              ) : ['REFLECTION', 'GO_NO_GO', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? (
                <HelpCircle className="w-12 h-12" />
              ) : (
                <MessageSquare className="w-12 h-12" />
              )}
              <h2 className="text-3xl font-bold tracking-tight uppercase">{activePrompt.title}</h2>
            </div>
            <p className="text-5xl md:text-6xl font-medium leading-tight text-gray-900 mb-12">
              {activePrompt.prompt_text}
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <div className="bg-indigo-100 text-indigo-800 px-6 py-3 rounded-full text-xl font-medium flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                {signals.length} {signals.length === 1 ? 'reactie' : 'reacties'} ontvangen
              </div>
            </div>

            {session.shared_signal_id && (
              <div className="mt-12 bg-white p-8 rounded-3xl shadow-lg border-2 border-indigo-200 animate-in zoom-in-95 duration-500 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <div className="flex items-center gap-3 text-indigo-600 mb-4">
                  <Sparkles className="w-6 h-6" />
                  <span className="font-bold uppercase tracking-widest text-sm">Uitgelicht antwoord</span>
                </div>
                {(() => {
                  const sharedSignal = allSignals.find(s => s.id === session.shared_signal_id);
                  if (!sharedSignal) return null;
                  
                  let definition = null;
                  if (sharedSignal.signal_type === 'WORD' && sharedSignal.payload_json) {
                    try {
                      const payload = JSON.parse(sharedSignal.payload_json);
                      definition = payload.definition;
                    } catch (e) {}
                  }

                  return (
                    <>
                      <p className="text-3xl md:text-4xl text-gray-800 font-medium leading-relaxed italic">
                        "{sharedSignal.text_value}"
                      </p>
                      {definition && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wider">Betekenis</h4>
                          <p className="text-2xl text-gray-700 leading-relaxed">
                            {definition}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {activePrompt.prompt_type === 'PEER_FEEDBACK' && signals.length > 0 && !session.shared_signal_id && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {signals.map((signal, idx) => (
                  <div key={signal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                    <p className="text-gray-800 text-lg italic">"{signal.text_value}"</p>
                    <div className="mt-4 text-sm text-gray-400 font-medium uppercase tracking-wider">Leerling {idx + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {!session.shared_signal_id && session.lesson_goal && (
              <div className="space-y-6 mb-12">
                <h3 className="text-2xl font-medium opacity-60 uppercase tracking-widest">Lesdoel</h3>
                <p className="text-5xl md:text-6xl font-medium leading-tight">{session.lesson_goal}</p>
              </div>
            )}
            
            {!session.shared_signal_id && !session.lesson_goal && (
              <div className="text-4xl font-medium opacity-40 mb-12">
                Kijk naar de docent voor instructies.
              </div>
            )}

            {/* Phase Specific Overviews */}
            {session.shared_signal_id && (
              <div className="w-full max-w-4xl mt-12 bg-white p-12 rounded-[3rem] shadow-xl border-2 border-blue-200 animate-in zoom-in-95 duration-500 text-left relative overflow-hidden">
                <div className="absolute top-0 left-0 w-3 h-full bg-blue-500"></div>
                <div className="flex items-center gap-4 text-blue-600 mb-6">
                  <MessageSquare className="w-8 h-8" />
                  <span className="font-bold uppercase tracking-widest text-lg">Uitgelicht</span>
                </div>
                {(() => {
                  const sharedSignal = allSignals.find(s => s.id === session.shared_signal_id);
                  if (!sharedSignal) return null;
                  
                  let definition = null;
                  if (sharedSignal.signal_type === 'WORD' && sharedSignal.payload_json) {
                    try {
                      const payload = JSON.parse(sharedSignal.payload_json);
                      definition = payload.definition;
                    } catch (e) {}
                  }

                  return (
                    <>
                      <p className="text-4xl md:text-5xl text-gray-900 font-bold leading-relaxed mb-6">
                        "{sharedSignal.text_value}"
                      </p>
                      {definition && (
                        <div className="mt-8 pt-8 border-t-2 border-gray-100">
                          <h4 className="text-xl font-bold text-blue-600 mb-4 uppercase tracking-wider">Betekenis</h4>
                          <p className="text-3xl text-gray-700 leading-relaxed">
                            {definition}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {!session.shared_signal_id && session.active_phase === 'CHECK' && (
              <div className="w-full max-w-3xl mt-8 grid grid-cols-2 gap-8 animate-in fade-in duration-500">
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {signals.filter(s => s.signal_type === 'CHECK').length}
                  </div>
                  <div className="text-xl font-medium opacity-70">Kunnen door</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
                  <div className="text-5xl font-bold text-amber-600 mb-2">
                    {signals.filter(s => s.signal_type === 'HELP').length}
                  </div>
                  <div className="text-xl font-medium opacity-70">Twijfelen nog</div>
                </div>
              </div>
            )}

            {!session.shared_signal_id && session.active_phase === 'VERWERKEN' && (
              <div className="w-full max-w-3xl mt-8 grid grid-cols-2 gap-8 animate-in fade-in duration-500">
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {signals.filter(s => s.signal_type === 'CHECK').length}
                  </div>
                  <div className="text-xl font-medium opacity-70">Zijn klaar</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
                  <div className="text-5xl font-bold text-red-600 mb-2">
                    {signals.filter(s => s.signal_type === 'HELP').length}
                  </div>
                  <div className="text-xl font-medium opacity-70">Lopen vast</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer: Timer placeholder */}
      <footer className="p-8 flex justify-center">
        {/* Timer will go here in a later block */}
      </footer>
    </div>
  );
}
