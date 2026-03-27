import React, { useState, useEffect } from 'react';
import { Play, Users, Presentation, Settings, CheckCircle2, HelpCircle, MessageSquare, CheckCircle, Clock, Sparkles, XCircle, ArrowLeft } from 'lucide-react';
import { ClassroomSession, ClassroomParticipant, ClassroomSignal, ClassroomSummary, ClassroomPrompt } from '../types';
import { useNavigate } from 'react-router-dom';

export default function TeacherClassroomPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  
  // Live Data State
  const [participants, setParticipants] = useState<ClassroomParticipant[]>([]);
  const [signals, setSignals] = useState<ClassroomSignal[]>([]);
  const [summaries, setSummaries] = useState<ClassroomSummary[]>([]);
  const [activePrompt, setActivePrompt] = useState<ClassroomPrompt | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptType, setPromptType] = useState<'CHECK_QUESTION' | 'HINT' | 'REFLECTION'>('CHECK_QUESTION');
  const [newPromptText, setNewPromptText] = useState('');

  // Form state
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [level, setLevel] = useState('');
  const [lessonGoal, setLessonGoal] = useState('');

  useEffect(() => {
    if (!session) return;

    // Fetch initial data
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

    // Setup WebSocket
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
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    };

    return () => ws.close();
  }, [session?.id]);

  const startSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_user_id: 'teacher-demo-1', // Hardcoded for MVP
          subject,
          grade,
          level,
          lesson_goal: lessonGoal
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
        // Successfully generated, update state directly just in case WebSocket misses it
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
    if (!session || !window.confirm('Weet je zeker dat je deze les wilt beëindigen?')) return;
    try {
      await fetch(`/api/sessions/${session.id}/end`, { method: 'PUT' });
      setSession(null);
      setParticipants([]);
      setSignals([]);
      setSummaries([]);
      setActivePrompt(null);
    } catch (err) {
      console.error(err);
    }
  };

  const createPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newPromptText.trim()) return;
    try {
      await fetch(`/api/sessions/${session.id}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: promptType === 'CHECK_QUESTION' ? 'Checkvraag' : promptType === 'HINT' ? 'Hint' : 'Reflectie',
          prompt_text: newPromptText,
          prompt_type: promptType,
          response_mode: promptType === 'HINT' ? 'ACKNOWLEDGE' : 'TEXT'
        })
      });
      setShowPromptModal(false);
      setNewPromptText('');
    } catch (err) {
      console.error(err);
      alert('Fout bij het aanmaken van de checkvraag');
    }
  };

  const closePrompt = async () => {
    if (!session || !activePrompt) return;
    try {
      await fetch(`/api/sessions/${session.id}/prompts/${activePrompt.id}/close`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (session) {
    const activePhaseSummary = summaries.find(s => s.phase === session.active_phase);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{session.subject} {session.grade}</h1>
            <p className="text-sm text-gray-500">Doel: {session.lesson_goal || 'Geen doel ingesteld'}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Bord Code</div>
              <div className="text-2xl font-mono font-bold text-blue-600 tracking-widest">{session.session_code}</div>
            </div>
            <button 
              onClick={() => window.open(`/board/${session.session_code}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Presentation className="w-4 h-4" />
              Open Board
            </button>
          </div>
        </header>

        {/* Main Dashboard */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6">
          
          {/* Left Column: Phase Control & Regie */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Phase Control */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Lesfase
              </h2>
              <div className="space-y-2">
                {['START', 'INSTRUCTION', 'PRACTICE', 'CLOSING'].map((phase) => (
                  <button
                    key={phase}
                    onClick={() => changePhase(phase)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                      session.active_phase === phase 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">
                      {phase === 'START' && '1. Start & Doel'}
                      {phase === 'INSTRUCTION' && '2. Instructie'}
                      {phase === 'PRACTICE' && '3. Verwerking'}
                      {phase === 'CLOSING' && '4. Afsluiting'}
                    </span>
                    {session.active_phase === phase && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Didactische Interventies */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-400" />
                Didactische Interventies
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => { setPromptType('CHECK_QUESTION'); setShowPromptModal(true); }}
                  disabled={!!activePrompt}
                  className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MessageSquare className="w-5 h-5" />
                  Stel een Checkvraag
                </button>
                <button
                  onClick={() => { setPromptType('HINT'); setShowPromptModal(true); }}
                  disabled={!!activePrompt}
                  className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  Deel een Hint
                </button>
                <button
                  onClick={() => { setPromptType('REFLECTION'); setShowPromptModal(true); }}
                  disabled={!!activePrompt}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Vraag om Reflectie
                </button>
              </div>
            </div>

            {/* Active Students List */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                Aanwezige Leerlingen ({participants.length})
              </h2>
              <div className="max-h-60 overflow-y-auto">
                {participants.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Nog geen leerlingen ingelogd.</p>
                ) : (
                  <ul className="space-y-2">
                    {participants.map(p => (
                      <li key={p.id} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                          {p.display_name.charAt(0).toUpperCase()}
                        </div>
                        {p.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* End Session Button */}
            <button 
              onClick={endSession}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Les Beëindigen
            </button>
          </div>

          {/* Right Column: Live Signals & Summary */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Active Prompt Card */}
            {activePrompt && (
              <div className={`rounded-xl shadow-sm border p-5 text-white ${
                activePrompt.prompt_type === 'HINT' ? 'bg-amber-600 border-amber-700' :
                activePrompt.prompt_type === 'REFLECTION' ? 'bg-emerald-600 border-emerald-700' :
                'bg-indigo-600 border-indigo-700'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {activePrompt.prompt_type === 'HINT' ? <Sparkles className="w-5 h-5 text-amber-200" /> :
                     activePrompt.prompt_type === 'REFLECTION' ? <CheckCircle2 className="w-5 h-5 text-emerald-200" /> :
                     <MessageSquare className="w-5 h-5 text-indigo-200" />}
                    Actieve {activePrompt.title}
                  </h2>
                  <button 
                    onClick={closePrompt}
                    className={`text-sm px-3 py-1.5 border rounded-lg transition-colors ${
                      activePrompt.prompt_type === 'HINT' ? 'bg-amber-700 border-amber-500 hover:bg-amber-800' :
                      activePrompt.prompt_type === 'REFLECTION' ? 'bg-emerald-700 border-emerald-500 hover:bg-emerald-800' :
                      'bg-indigo-700 border-indigo-500 hover:bg-indigo-800'
                    }`}
                  >
                    Sluit {activePrompt.title}
                  </button>
                </div>
                <p className="text-xl font-medium mb-4">{activePrompt.prompt_text}</p>
                
                <div className={`rounded-lg p-4 ${
                  activePrompt.prompt_type === 'HINT' ? 'bg-amber-700/50' :
                  activePrompt.prompt_type === 'REFLECTION' ? 'bg-emerald-700/50' :
                  'bg-indigo-700/50'
                }`}>
                  <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${
                    activePrompt.prompt_type === 'HINT' ? 'text-amber-200' :
                    activePrompt.prompt_type === 'REFLECTION' ? 'text-emerald-200' :
                    'text-indigo-200'
                  }`}>
                    {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen door' : 'Antwoorden van leerlingen'}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {signals.filter(s => s.prompt_id === activePrompt.id && s.signal_type === 'RESPONSE').length === 0 ? (
                      <p className={`italic text-sm ${
                        activePrompt.prompt_type === 'HINT' ? 'text-amber-300' :
                        activePrompt.prompt_type === 'REFLECTION' ? 'text-emerald-300' :
                        'text-indigo-300'
                      }`}>
                        Nog geen reacties ontvangen...
                      </p>
                    ) : (
                      signals.filter(s => s.prompt_id === activePrompt.id && s.signal_type === 'RESPONSE').map(signal => {
                        const student = participants.find(p => p.id === signal.participant_id);
                        return (
                          <div key={signal.id} className="bg-white/10 rounded px-3 py-2 text-sm flex justify-between items-center">
                            <span className={`font-medium ${
                              activePrompt.prompt_type === 'HINT' ? 'text-amber-100' :
                              activePrompt.prompt_type === 'REFLECTION' ? 'text-emerald-100' :
                              'text-indigo-100'
                            }`}>{student?.display_name || 'Onbekend'}</span>
                            <span className="text-white">
                              {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen ✓' : signal.text_value}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-5">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  AI Klasduiding
                </h2>
                <button 
                  onClick={generateSummary}
                  disabled={generatingSummary}
                  className="text-sm px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {generatingSummary ? 'Bezig...' : 'Genereer nu'}
                </button>
              </div>
              
              {activePhaseSummary ? (
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{activePhaseSummary.headline}</h3>
                  <p className="text-gray-700">{activePhaseSummary.body}</p>
                  <div className="text-xs text-indigo-400 font-medium mt-2">
                    Gebaseerd op {activePhaseSummary.evidence_count} signalen • Laatste update: {new Date(activePhaseSummary.generated_at).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-indigo-400/80 italic">
                  Nog geen samenvatting voor deze fase. Klik op 'Genereer nu' om signalen te clusteren.
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                  <div className="text-sm text-gray-500 font-medium">Leerlingen</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {signals.filter(s => s.signal_type === 'HELP' && s.phase === session.active_phase).length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Hulpvragen (nu)</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {signals.filter(s => s.signal_type === 'CHECK' && s.phase === session.active_phase).length}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Klaar (nu)</div>
                </div>
              </div>
            </div>

            {/* Live Feed */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-5 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Live Signalen</h3>
                <span className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Live
                </span>
              </div>
              
              <div className="p-0 max-h-[400px] overflow-y-auto">
                {signals.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nog geen signalen ontvangen in deze les.</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {signals.map(signal => {
                      const student = participants.find(p => p.id === signal.participant_id);
                      
                      let Icon = HelpCircle;
                      let colorClass = 'text-gray-500 bg-gray-100';
                      let label = 'Onbekend signaal';
                      
                      if (signal.signal_type === 'HELP') {
                        Icon = HelpCircle;
                        colorClass = 'text-red-600 bg-red-100';
                        label = 'Heeft hulp nodig';
                      } else if (signal.signal_type === 'WORD') {
                        Icon = MessageSquare;
                        colorClass = 'text-blue-600 bg-blue-100';
                        label = 'Vraagt om een woordverklaring';
                      } else if (signal.signal_type === 'CHECK') {
                        Icon = CheckCircle;
                        colorClass = 'text-green-600 bg-green-100';
                        label = 'Is klaar met de taak';
                      } else if (signal.signal_type === 'RESPONSE') {
                        Icon = MessageSquare;
                        colorClass = 'text-indigo-600 bg-indigo-100';
                        label = 'Heeft gereageerd op een vraag';
                      }

                      return (
                        <li key={signal.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-gray-900">{student?.display_name || 'Onbekende leerling'}</span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5">{label}</p>
                            {signal.text_value && (
                              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 italic shadow-sm">
                                "{signal.text_value}"
                              </div>
                            )}
                            <div className="mt-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Fase: {signal.phase}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

          </div>

        </main>

        {/* Prompt Modal */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">
                  {promptType === 'CHECK_QUESTION' ? 'Stel een Checkvraag' : promptType === 'HINT' ? 'Deel een Hint' : 'Vraag om Reflectie'}
                </h2>
                <button onClick={() => setShowPromptModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={createPrompt} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {promptType === 'CHECK_QUESTION' ? 'Wat wil je de leerlingen vragen?' : promptType === 'HINT' ? 'Welke hint wil je delen?' : 'Waar wil je dat de leerlingen op reflecteren?'}
                  </label>
                  <textarea
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    placeholder={promptType === 'CHECK_QUESTION' ? 'Bijv. Wat is de belangrijkste oorzaak van...' : promptType === 'HINT' ? 'Bijv. Let op de eenheden bij het berekenen van...' : 'Bijv. Wat vond je het lastigst aan deze opdracht?'}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[100px] resize-none"
                    autoFocus
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPromptModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={!newPromptText.trim()}
                    className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      promptType === 'HINT' ? 'bg-amber-600 hover:bg-amber-700' :
                      promptType === 'REFLECTION' ? 'bg-emerald-600 hover:bg-emerald-700' :
                      'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    Verstuur naar klas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar start
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Start nieuwe les</h1>
        </div>
        
        <form onSubmit={startSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vak *</label>
            <input 
              required
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="bijv. Wiskunde"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Klas</label>
              <input 
                type="text" 
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="bijv. 3B"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <input 
                type="text" 
                value={level}
                onChange={e => setLevel(e.target.value)}
                placeholder="bijv. HAVO"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesdoel (optioneel)</label>
            <textarea 
              value={lessonGoal}
              onChange={e => setLessonGoal(e.target.value)}
              placeholder="Wat leren we vandaag?"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? 'Bezig met starten...' : 'Start Sessie'}
          </button>
        </form>
      </div>
    </div>
  );
}
