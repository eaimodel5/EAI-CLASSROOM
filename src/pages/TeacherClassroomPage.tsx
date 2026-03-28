import React, { useState, useEffect } from 'react';
import { Play, Users, Presentation, Settings, CheckCircle2, HelpCircle, MessageSquare, CheckCircle, Clock, Sparkles, XCircle, ArrowLeft, Wrench, MonitorPlay, LayoutGrid } from 'lucide-react';
import { ClassroomSession, ClassroomParticipant, ClassroomSignal, ClassroomSummary, ClassroomPrompt } from '../types';
import { useNavigate } from 'react-router-dom';
import { WidgetSelector } from '../components/widgets/WidgetSelector';
import { WidgetType, WidgetInstance } from '../components/widgets/WidgetRegistry';

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
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg shadow-sm border ${
      isEnded ? 'bg-red-100 text-red-700 border-red-200' :
      isWarning ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' :
      'bg-white text-gray-800 border-gray-200'
    }`}>
      <Clock className={`w-5 h-5 ${isEnded ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-500'}`} />
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}

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
  const [showAllTools, setShowAllTools] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [promptType, setPromptType] = useState<'CHECK_QUESTION' | 'HINT' | 'REFLECTION' | 'DIAGNOSTIC' | 'MISCONCEPTION' | 'GO_NO_GO' | 'CONFIDENCE' | 'CLASS_INTERVENTION' | 'EXIT_TICKET' | 'PRIOR_KNOWLEDGE' | 'PEER_FEEDBACK' | 'WHEEL_OF_NAMES'>('CHECK_QUESTION');
  const [newPromptText, setNewPromptText] = useState('');

  const PROMPT_CONFIG = {
    CHECK_QUESTION: { title: 'Checkvraag', label: 'Wat wil je de leerlingen vragen?', placeholder: 'Bijv. Wat is de belangrijkste oorzaak van...', color: 'bg-indigo-600 hover:bg-indigo-700', responseMode: 'TEXT' },
    HINT: { title: 'Hint', label: 'Welke hint wil je delen?', placeholder: 'Bijv. Let op de eenheden bij het berekenen van...', color: 'bg-amber-600 hover:bg-amber-700', responseMode: 'ACKNOWLEDGE' },
    REFLECTION: { title: 'Reflectie', label: 'Waar wil je dat de leerlingen op reflecteren?', placeholder: 'Bijv. Wat vond je het lastigst aan deze opdracht?', color: 'bg-emerald-600 hover:bg-emerald-700', responseMode: 'TEXT' },
    DIAGNOSTIC: { title: 'Diagnostische Vraag', label: 'Stel een diagnostische vraag', placeholder: 'Bijv. Welke stap in de berekening is fout?', color: 'bg-indigo-600 hover:bg-indigo-700', responseMode: 'TEXT' },
    MISCONCEPTION: { title: 'Misconceptie Check', label: 'Welke misconceptie wil je toetsen?', placeholder: 'Bijv. Waarom is het niet waar dat...', color: 'bg-orange-600 hover:bg-orange-700', responseMode: 'TEXT' },
    GO_NO_GO: { title: 'Doorgaan / Niet-doorgaan', label: 'Wat is de checkvraag voor de volgende stap?', placeholder: 'Bijv. Ben je klaar om te beginnen met...', color: 'bg-indigo-600 hover:bg-indigo-700', responseMode: 'TEXT' },
    CONFIDENCE: { title: 'Confidence Meter', label: 'Waarover wil je het vertrouwen peilen?', placeholder: 'Bijv. Hoe zeker ben je over je antwoord?', color: 'bg-emerald-600 hover:bg-emerald-700', responseMode: 'TEXT' },
    CLASS_INTERVENTION: { title: 'Klassikale Interventie', label: 'Wat wil je klassikaal bespreken?', placeholder: 'Bijv. Ik zie dat veel leerlingen vastlopen op...', color: 'bg-red-600 hover:bg-red-700', responseMode: 'ACKNOWLEDGE' },
    EXIT_TICKET: { title: 'Exit Ticket', label: 'Wat is de afsluitende vraag?', placeholder: 'Bijv. Wat is het belangrijkste dat je vandaag hebt geleerd?', color: 'bg-purple-600 hover:bg-purple-700', responseMode: 'TEXT' },
    PRIOR_KNOWLEDGE: { title: 'Voorkennis Ophalen', label: 'Welke voorkennis wil je activeren?', placeholder: 'Bijv. Wat weet je nog over...', color: 'bg-blue-600 hover:bg-blue-700', responseMode: 'TEXT' },
    PEER_FEEDBACK: { title: 'Peer Feedback', label: 'Wat is de opdracht voor peer feedback?', placeholder: 'Bijv. Kijk naar het werk van je buurman/buurvrouw en geef 1 top en 1 tip.', color: 'bg-teal-600 hover:bg-teal-700', responseMode: 'TEXT' },
    WHEEL_OF_NAMES: { title: 'Willekeurige Beurt', label: 'Wie is er aan de beurt?', placeholder: 'Naam van de leerling...', color: 'bg-pink-600 hover:bg-pink-700', responseMode: 'ACKNOWLEDGE' }
  };

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
            <TimerDisplay session={session} />
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
                {['START', 'INSTRUCTIE', 'CHECK', 'VERWERKEN', 'AFSLUITING'].map((phase) => (
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
                      {phase === 'INSTRUCTIE' && '2. Instructie'}
                      {phase === 'CHECK' && '3. Check van Begrip'}
                      {phase === 'VERWERKEN' && '4. Verwerking'}
                      {phase === 'AFSLUITING' && '5. Afsluiting'}
                    </span>
                    {session.active_phase === phase && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Toolbox */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-gray-400" />
                  Toolbox
                </h2>
                <button 
                  onClick={() => setShowAllTools(!showAllTools)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showAllTools ? 'Toon alleen actuele fase' : 'Toon alle tools'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                {showAllTools 
                  ? 'Alle beschikbare didactische tools.' 
                  : 'Tools passen zich automatisch aan op basis van de actieve lesfase (Right tool, right moment).'}
              </p>
              <div className="space-y-3">
                {(showAllTools || session.active_phase === 'START') && (
                  <button
                    onClick={() => { setPromptType('PRIOR_KNOWLEDGE'); setShowPromptModal(true); }}
                    disabled={!!activePrompt}
                    className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Voorkennis ophalen
                  </button>
                )}

                {(showAllTools || session.active_phase === 'INSTRUCTIE') && (
                  <>
                    <button
                      onClick={() => { setPromptType('DIAGNOSTIC'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Diagnostische Vraag
                    </button>
                    <button
                      onClick={() => { setPromptType('MISCONCEPTION'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium rounded-lg border border-orange-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <HelpCircle className="w-5 h-5" />
                      Misconceptie Check
                    </button>
                  </>
                )}

                {(showAllTools || session.active_phase === 'CHECK') && (
                  <>
                    <button
                      onClick={() => { setPromptType('GO_NO_GO'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Doorgaan / Niet-doorgaan Check
                    </button>
                    <button
                      onClick={() => { setPromptType('CONFIDENCE'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5" />
                      Confidence Meter
                    </button>
                    <button
                      onClick={pickRandomName}
                      disabled={!!activePrompt || participants.length === 0}
                      className="w-full py-3 px-4 bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium rounded-lg border border-pink-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Users className="w-5 h-5" />
                      Willekeurige Beurt
                    </button>
                  </>
                )}

                {(showAllTools || session.active_phase === 'VERWERKEN') && (
                  <>
                    <button
                      onClick={() => { setPromptType('HINT'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5" />
                      Deel een Hint
                    </button>
                    <button
                      onClick={() => { setPromptType('CLASS_INTERVENTION'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Klassikale Interventie
                    </button>
                    <button
                      onClick={() => { setPromptType('PEER_FEEDBACK'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium rounded-lg border border-teal-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Users className="w-5 h-5" />
                      Peer Feedback
                    </button>
                  </>
                )}

                {(showAllTools || session.active_phase === 'AFSLUITING') && (
                  <>
                    <button
                      onClick={() => { setPromptType('EXIT_TICKET'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg border border-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Exit Ticket
                    </button>
                    <button
                      onClick={() => { setPromptType('REFLECTION'); setShowPromptModal(true); }}
                      disabled={!!activePrompt}
                      className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Reflectieprompt
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Klassenmanagement */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" />
                Klassenmanagement
              </h2>
              <div className="space-y-4">
                {/* Lock Session */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">Sessie Vergrendelen</h3>
                    <p className="text-xs text-gray-500">Voorkom dat nieuwe leerlingen deelnemen</p>
                  </div>
                  <button
                    onClick={toggleLock}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${session.is_locked ? 'bg-red-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${session.is_locked ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Timer */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Timer Instellen
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setTimer(1)} className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">1 min</button>
                    <button onClick={() => setTimer(3)} className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">3 min</button>
                    <button onClick={() => setTimer(5)} className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">5 min</button>
                    <button onClick={() => setTimer(0)} className="flex-1 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors">Stop</button>
                  </div>
                </div>
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
                      <li key={p.id} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg group">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                            {p.display_name.charAt(0).toUpperCase()}
                          </div>
                          {p.display_name}
                        </div>
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Verwijder leerling"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
                ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'bg-amber-600 border-amber-700' :
                ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'bg-emerald-600 border-emerald-700' :
                ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'bg-orange-600 border-orange-700' :
                'bg-indigo-600 border-indigo-700'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? <Sparkles className="w-5 h-5 text-amber-200" /> :
                     ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? <CheckCircle2 className="w-5 h-5 text-emerald-200" /> :
                     ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? <HelpCircle className="w-5 h-5 text-orange-200" /> :
                     <MessageSquare className="w-5 h-5 text-indigo-200" />}
                    Actieve {activePrompt.title}
                  </h2>
                  <button 
                    onClick={closePrompt}
                    className={`text-sm px-3 py-1.5 border rounded-lg transition-colors ${
                      ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'bg-amber-700 border-amber-500 hover:bg-amber-800' :
                      ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'bg-emerald-700 border-emerald-500 hover:bg-emerald-800' :
                      ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'bg-orange-700 border-orange-500 hover:bg-orange-800' :
                      'bg-indigo-700 border-indigo-500 hover:bg-indigo-800'
                    }`}
                  >
                    Sluit {activePrompt.title}
                  </button>
                </div>
                <p className="text-xl font-medium mb-4">{activePrompt.prompt_text}</p>
                
                <div className={`rounded-lg p-4 ${
                  ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'bg-amber-700/50' :
                  ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'bg-emerald-700/50' :
                  ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'bg-orange-700/50' :
                  'bg-indigo-700/50'
                }`}>
                  <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${
                    ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'text-amber-200' :
                    ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'text-emerald-200' :
                    ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'text-orange-200' :
                    'text-indigo-200'
                  }`}>
                    {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen door' : 'Antwoorden van leerlingen'}
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {signals.filter(s => s.prompt_id === activePrompt.id && s.signal_type === 'RESPONSE').length === 0 ? (
                      <p className={`italic text-sm ${
                        ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'text-amber-300' :
                        ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'text-emerald-300' :
                        ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'text-orange-300' :
                        'text-indigo-300'
                      }`}>
                        Nog geen reacties ontvangen...
                      </p>
                    ) : (
                      signals.filter(s => s.prompt_id === activePrompt.id && s.signal_type === 'RESPONSE').map(signal => {
                        const student = participants.find(p => p.id === signal.participant_id);
                        const isShared = session.shared_signal_id === signal.id;
                        return (
                          <div key={signal.id} className={`rounded px-3 py-2 text-sm flex justify-between items-center transition-colors ${isShared ? 'bg-white/30 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}`}>
                            <div className="flex-1">
                              <span className={`font-medium ${
                                ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'text-amber-100' :
                                ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'text-emerald-100' :
                                ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'text-orange-100' :
                                'text-indigo-100'
                              }`}>{student?.display_name || 'Onbekend'}</span>
                              <span className="text-white ml-2">
                                {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen ✓' : signal.text_value}
                              </span>
                            </div>
                            {activePrompt.response_mode !== 'ACKNOWLEDGE' && (
                              <button
                                onClick={() => shareSignal(isShared ? null : signal.id)}
                                className={`ml-4 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                  isShared 
                                    ? 'bg-white text-indigo-900 hover:bg-gray-100' 
                                    : 'bg-black/20 text-white hover:bg-black/40'
                                }`}
                              >
                                {isShared ? 'Verberg op bord' : 'Deel op bord'}
                              </button>
                            )}
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
                              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 shadow-sm">
                                <span className="font-semibold">"{signal.text_value}"</span>
                                {signal.signal_type === 'WORD' && signal.payload_json && (
                                  <div className="mt-2 pt-2 border-t border-gray-100 text-gray-600">
                                    {(() => {
                                      try {
                                        const payload = JSON.parse(signal.payload_json);
                                        return payload.definition ? <p>{payload.definition}</p> : null;
                                      } catch (e) {
                                        return null;
                                      }
                                    })()}
                                    <button
                                      onClick={() => shareSignal(session.shared_signal_id === signal.id ? null : signal.id)}
                                      className={`mt-3 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                                        session.shared_signal_id === signal.id
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                    >
                                      <MonitorPlay className="w-3 h-3" />
                                      {session.shared_signal_id === signal.id ? 'Gedeeld op bord' : 'Deel op bord'}
                                    </button>
                                  </div>
                                )}
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
                  {PROMPT_CONFIG[promptType].title}
                </h2>
                <button onClick={() => setShowPromptModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={createPrompt} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {PROMPT_CONFIG[promptType].label}
                  </label>
                  <textarea
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    placeholder={PROMPT_CONFIG[promptType].placeholder}
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
                    className={`px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${PROMPT_CONFIG[promptType].color}`}
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
