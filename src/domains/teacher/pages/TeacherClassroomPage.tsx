import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Wrench, MessagesSquare, LayoutGrid, LayoutDashboard, Zap, Activity, Users, Radio, PanelRightClose } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { emptyLessonPreparation, LessonPreparation } from '../../../types';
import { WidgetSelector } from '../../../components/widgets/WidgetSelector';
import { WidgetRenderer } from '../../../components/widgets/WidgetRenderer';
import { WidgetInstance } from '../../../components/widgets/WidgetRegistry';
import { LessonPreparationForm } from '../../../components/LessonPreparationForm';

import { useTeacherSession } from '../hooks/useTeacherSession';
import { useTeacherActions } from '../hooks/useTeacherActions';
import { PromptType } from '../types';

import { SessionHeader } from '../components/SessionHeader';
import { PhaseControls } from '../components/PhaseControls';
import { QuickActions } from '../components/QuickActions';
import { InterventionTools } from '../components/InterventionTools';
import { ClassManagement } from '../components/ClassManagement';
import { ActiveStudentsList } from '../components/ActiveStudentsList';
import { ActivePromptCard } from '../components/ActivePromptCard';
import { AiSummaryCard } from '../components/AiSummaryCard';
import { TeacherProposalCard } from '../components/TeacherProposalCard';
import { ClassStats } from '../components/ClassStats';
import { LiveFeed } from '../components/LiveFeed';
import { PromptModal } from '../components/PromptModal';
import { PrintableLessonPlan } from '../components/PrintableLessonPlan';
import GridBackground from '../../../components/GridBackground';

type DashboardModule = 'OVERVIEW' | 'INTERACTIONS' | 'MONITOR' | 'STUDENTS';

import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';

export function TeacherClassroomPage() {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Sign out error', err);
    }
  };
  
  const {
    session,
    setSession,
    participants,
    setParticipants,
    signals,
    setSignals,
    summaries,
    setSummaries,
    proposals,
    setProposals,
    activePrompt,
    setActivePrompt,
    loading,
    setLoading,
    initialLoading
  } = useTeacherSession();

  const actions = useTeacherActions({
    session,
    setSession,
    participants,
    setParticipants,
    setSignals,
    setSummaries,
    setActivePrompt,
    setLoading
  });

  // Local UI State
  const [activeModule, setActiveModule] = useState<DashboardModule>('OVERVIEW');
  const [showAllTools, setShowAllTools] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('CHECK_QUESTION');
  const [newPromptText, setNewPromptText] = useState('');
  const [printModePrep, setPrintModePrep] = useState<LessonPreparation | null>(null);
  const [isEditingPrep, setIsEditingPrep] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleOpenPrompt = (type: PromptType, text: string) => {
    setPromptType(type);
    setNewPromptText(text);
    setShowPromptModal(true);
  };

  const handleSubmitPrompt = async (type: PromptType, text: string) => {
    const success = await actions.createPrompt(type, text);
    if (success) {
      setShowPromptModal(false);
      setNewPromptText('');
      setActiveModule('INTERACTIONS'); // Auto-switch to interactions to see active prompt
    }
  };

  const handleSavePrep = async (prep: LessonPreparation) => {
    await actions.updateSessionPrep(prep);
    setIsEditingPrep(false);
  };

  const parsedPrep: LessonPreparation | null = session?.prep_json ? JSON.parse(session.prep_json) : null;
  const activePhaseProposals = session ? proposals.filter((p: any) => p.phase === session.active_phase && p.status !== 'DISMISSED') : [];

  const handleDismissProposal = async (id: string) => {
    if (!session) return;
    try {
      await updateDoc(doc(db, `classroom_sessions/${session.id}/proposals`, id), {
        status: 'DISMISSED',
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to dismiss proposal', err);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-4 relative">
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <GridBackground />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-semibold text-lg">Laden van actieve sessie...</p>
          <p className="text-slate-400 text-sm mt-1">Een ogenblik geduld alstublieft</p>
        </div>
      </div>
    );
  }

  if (session && !isEditingPrep) {
    const activeWidgets = JSON.parse(session.widgets_json || '[]');

    return (
      <div className="h-screen w-screen bg-transparent flex flex-col relative overflow-hidden select-none">
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <GridBackground />
          <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[1px]"></div>
        </div>

        <SessionHeader 
          session={session} 
          onOpenWidgets={() => setShowWidgetSelector(true)} 
          onEditPrep={() => setIsEditingPrep(true)}
        />

        <div className="flex-1 w-full flex flex-row min-h-0 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className={`transition-all duration-300 ease-in-out shrink-0 bg-white/95 backdrop-blur-2xl border-r border-slate-200/60 flex flex-col justify-between h-full z-10 shadow-[10px_0_30px_rgba(0,0,0,0.015)] ${
            isSidebarOpen ? 'w-60 p-5' : 'w-16 p-3'
          }`}>
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 flex flex-col">
              <div className="flex justify-between items-center">
                {isSidebarOpen && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 select-none">Mijn Cockpit</span>}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mx-auto">
                   <PanelRightClose className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
                </button>
              </div>
              
              <div>
                <h3 className={`text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3 select-none ${isSidebarOpen ? 'block' : 'hidden'}`}>Modules</h3>
                <nav className="flex flex-col gap-2">
                  <button 
                    onClick={() => setActiveModule('OVERVIEW')} 
                    title="Control Center"
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition-all duration-200 ${
                      activeModule === 'OVERVIEW' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
                    } ${!isSidebarOpen && 'justify-center px-1'}`}
                  >
                    <LayoutDashboard className={`w-4.5 h-4.5 shrink-0 ${activeModule === 'OVERVIEW' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`text-xs transition-all duration-150 ${isSidebarOpen ? 'opacity-100 w-auto font-bold' : 'hidden opacity-0 w-0 overflow-hidden'}`}>Control Center</span>
                  </button>

                  <button 
                    onClick={() => setActiveModule('INTERACTIONS')}
                    title="AI & Interacties" 
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition-all duration-200 relative ${
                      activeModule === 'INTERACTIONS' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
                    } ${!isSidebarOpen && 'justify-center px-1'}`}
                  >
                    <Zap className={`w-4.5 h-4.5 shrink-0 ${activeModule === 'INTERACTIONS' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`text-xs transition-all duration-150 ${isSidebarOpen ? 'opacity-100 w-auto font-bold' : 'hidden opacity-0 w-0 overflow-hidden'}`}>AI Studio</span>
                    {activePrompt && (
                      <span className={`absolute ${isSidebarOpen ? 'right-4' : 'top-1 right-1'} w-2 h-2 rounded-full bg-red-400 animate-pulse`}></span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveModule('MONITOR')} 
                    title="Live Monitor"
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition-all duration-200 ${
                      activeModule === 'MONITOR' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
                    } ${!isSidebarOpen && 'justify-center px-1'}`}
                  >
                    <Radio className={`w-4.5 h-4.5 shrink-0 ${activeModule === 'MONITOR' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`text-xs transition-all duration-150 ${isSidebarOpen ? 'opacity-100 w-auto font-bold' : 'hidden opacity-0 w-0 overflow-hidden'}`}>Grote Live Feed</span>
                  </button>

                  <button 
                    onClick={() => setActiveModule('STUDENTS')}
                    title="Klas & Beheer" 
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold transition-all duration-200 ${
                      activeModule === 'STUDENTS' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
                    } ${!isSidebarOpen && 'justify-center px-1'}`}
                  >
                    <Users className={`w-4.5 h-4.5 shrink-0 ${activeModule === 'STUDENTS' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`text-xs transition-all duration-150 ${isSidebarOpen ? 'opacity-100 w-auto font-bold' : 'hidden opacity-0 w-0 overflow-hidden'}`}>Klas & Beheer</span>
                  </button>
                </nav>
              </div>
            </div>

            <div className={`pt-4 border-t border-slate-200/80 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
              <button 
                onClick={actions.endSession}
                className="w-full py-3 px-4 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-2 group"
              >
                <XCircle className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs">Les Beëindigen</span>
              </button>
            </div>
          </div>

          {/* Main Content Workspace (Strictly restricted to 1-screen viewport) */}
          <main className="flex-1 p-4 lg:p-6 overflow-hidden relative z-0 flex flex-col h-full min-h-0 bg-slate-50/50">
            
            {/* OVERVIEW MODULE */}
            {activeModule === 'OVERVIEW' && (
              <div className="h-full w-full flex flex-col min-h-0 overflow-hidden gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Cockpit Control Center</h1>
                    <p className="text-slate-500 font-medium text-xs mt-1">Houd 100% didactisch overzicht over de hele klas in één oogopslag.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 font-black rounded-lg text-[10px] uppercase border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Realtime Actief
                    </span>
                  </div>
                </div>

                {/* 3-Column Visual Dashboard Grid */}
                <div className="flex-grow flex-1 min-h-0 grid grid-cols-12 gap-5 overflow-hidden items-stretch">
                  
                  {/* Left Column (col-span-4): Live Connection Terminal of student inputs */}
                  <div className="col-span-4 h-full min-h-0 flex flex-col">
                    <LiveFeed 
                      signals={signals}
                      participants={participants}
                      sharedSignalId={session.shared_signal_id}
                      onShareSignal={actions.shareSignal}
                    />
                  </div>

                  {/* Center Column (col-span-5): Active Interaction & Step Controls */}
                  <div className="col-span-5 h-full min-h-0 flex flex-col gap-4">
                    {/* Compact Horizontal Phase steps bar */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-4 shrink-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-indigo-500" /> Lesfase Controller
                        </h3>
                        <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 py-0.5 px-2 rounded-md border border-indigo-100">
                          {session.active_phase === 'START' ? 'Fase 1: Start' :
                           session.active_phase === 'INSTRUCTIE' ? 'Fase 2: Instructie' :
                           session.active_phase === 'CHECK' ? 'Fase 3: Check' :
                           session.active_phase === 'VERWERKEN' ? 'Fase 4: Verwerking' : 'Fase 5: Sluiting'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                        {['START', 'INSTRUCTIE', 'CHECK', 'VERWERKEN', 'AFSLUITING'].map((phaseKey, index) => {
                          const isSelected = session.active_phase === phaseKey;
                          const labels: Record<string, string> = {
                            START: 'Start',
                            INSTRUCTIE: 'Instr.',
                            CHECK: 'Check',
                            VERWERKEN: 'Verwerk.',
                            AFSLUITING: 'Afsluit.'
                          };
                          return (
                            <button
                              key={phaseKey}
                              onClick={() => actions.changePhase(phaseKey as "START" | "INSTRUCTIE" | "CHECK" | "VERWERKEN" | "AFSLUITING")}
                              className={`py-1.5 px-1 rounded-lg text-xs font-black transition-all text-center select-none cursor-pointer ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-800'
                              }`}
                            >
                              <span className="block text-[8px] opacity-70 mb-0.5">{index + 1}</span>
                              <span className="block truncate text-[11px] font-bold">{labels[phaseKey]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interaction Arena */}
                    <div className="flex-1 min-h-0 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col overflow-hidden">
                      {activePrompt ? (
                        <div className="h-full flex flex-col min-h-0 overflow-hidden">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-shrink-0">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                              ⚡ Actieve Vraag op het Bord
                            </span>
                            <button
                              onClick={() => actions.closePrompt(activePrompt.id)}
                              className="text-[10px] font-black text-red-600 hover:text-red-700 hover:bg-red-50 py-1 px-2 rounded-lg border border-red-200 animate-pulse transition-all cursor-pointer"
                            >
                              Sluit Vraag
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto pr-1">
                            <ActivePromptCard 
                              activePrompt={activePrompt}
                              signals={signals}
                              participants={participants}
                              sharedSignalId={session.shared_signal_id}
                              onClosePrompt={() => actions.closePrompt(activePrompt.id)}
                              onShareSignal={actions.shareSignal}
                              onUpdateParticipant={actions.updateParticipant}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col min-h-0 overflow-hidden">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-shrink-0">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                              🚀 Start een Interactie
                            </span>
                            <button 
                              onClick={() => setShowAllTools(!showAllTools)} 
                              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors font-bold"
                            >
                              {showAllTools ? 'Gefilterd' : 'Toon alles'}
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                            {/* Prepared Questions Section */}
                            {parsedPrep && (
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 pl-1.5">
                                  <span>📖</span> Bereidde Vragen uit Leskaart
                                </h4>
                                <QuickActions 
                                  parsedPrep={parsedPrep}
                                  activePhase={session.active_phase}
                                  showAllTools={showAllTools}
                                  hasActivePrompt={!!activePrompt}
                                  onOpenPrompt={handleOpenPrompt}
                                />
                              </div>
                            )}

                            {/* Standard interaction prompts deck */}
                            <div className="space-y-1.5">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 pl-1.5">
                                <span>🛠️</span> On-the-fly Werkvormen
                              </h4>
                              <InterventionTools 
                                activePhase={session.active_phase}
                                showAllTools={showAllTools}
                                hasActivePrompt={!!activePrompt}
                                hasParticipants={participants.length > 0}
                                onOpenPrompt={handleOpenPrompt}
                                onPickRandomName={actions.pickRandomName}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (col-span-3): Hardware overrides & seat grid */}
                  <div className="col-span-3 h-full min-h-0 flex flex-col gap-4">
                    {/* Compact Admin Settings bar */}
                    <div className="flex-shrink-0 bg-slate-800 text-white backdrop-blur-xl rounded-2xl p-4 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/30 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                      <div className="relative z-10">
                        <ClassManagement 
                          isLocked={session.is_locked}
                          onToggleLock={actions.toggleLock}
                          isHelpQuestionsEnabled={session.help_questions_enabled !== 0}
                          onToggleHelpQuestions={actions.toggleHelpQuestions}
                          onSetTimer={actions.setTimer}
                        />
                      </div>
                    </div>

                    {/* Quick Active Student Grid */}
                    <div className="flex-1 min-h-0">
                      <ActiveStudentsList 
                        participants={participants}
                        onRemoveParticipant={actions.removeParticipant}
                        onUpdateParticipant={actions.updateParticipant}
                        onSendPrivateMessage={actions.sendPrivateMessage}
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* AI & INTERACTIES MODULE */}
            {activeModule === 'INTERACTIONS' && (
              <div className="h-full w-full flex flex-col min-h-0 overflow-hidden gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none font-sans">AI & Interacties Studio</h1>
                    <p className="text-slate-500 font-medium text-xs mt-1">Zet AI-analyses in en raadpleeg didactische voorstellen om leerlingen te triggeren.</p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  {activePrompt && (
                    <div className="w-full shrink-0">
                      <ActivePromptCard 
                        activePrompt={activePrompt}
                        signals={signals}
                        participants={participants}
                        sharedSignalId={session.shared_signal_id}
                        onClosePrompt={() => actions.closePrompt(activePrompt.id)}
                        onShareSignal={actions.shareSignal}
                        onUpdateParticipant={actions.updateParticipant}
                      />
                    </div>
                  )}
                  
                  <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-5 flex flex-col shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                      <h3 className="font-bold text-slate-800 text-sm">Didactische Voorstellen (AI)</h3>
                      <button
                        onClick={() => actions.generateTeacherProposal(signals, participants, 'PHASE_BRIEFING')}
                        disabled={actions.generatingSummary}
                        className="text-xs px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {actions.generatingSummary ? 'Analyseren...' : 'Genereer nieuw voorstel'}
                      </button>
                    </div>
                    {activePhaseProposals.length > 0 ? (
                      <div className="space-y-3">
                        {activePhaseProposals.map((proposal) => (
                          <TeacherProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            onStartAction={actions.startTeacherAction}
                            onDismiss={handleDismissProposal}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center text-xs text-indigo-700 font-medium leading-relaxed">
                        Nog geen Didactische AI-voorstellen gegenereerd voor deze lesfase. Klik op de knop om te starten!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* LIVE MONITOR MODULE */}
            {activeModule === 'MONITOR' && (
              <div className="h-full w-full flex flex-col min-h-0 overflow-hidden gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Grote Live Monitor</h1>
                  <p className="text-slate-500 font-medium text-xs mt-1">Eindeloos grootscherm-overzicht van alle activiteit, reacties en tekeningen.</p>
                </div>

                <div className="flex-1 min-h-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
                  <LiveFeed 
                    signals={signals}
                    participants={participants}
                    sharedSignalId={session.shared_signal_id}
                    onShareSignal={actions.shareSignal}
                  />
                </div>
              </div>
            )}

            {/* STUDENTS & BEHEER MODULE */}
            {activeModule === 'STUDENTS' && (
              <div className="h-full w-full flex flex-col min-h-0 overflow-hidden gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0 flex justify-between items-center">
                  <div>
                    <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Klassenlijst & Rechten</h1>
                    <p className="text-slate-500 font-medium text-xs mt-1">Klik op leerlingen om privileges te veranderen, te muten of te verwijderen.</p>
                  </div>
                  <span className="text-xs font-black bg-indigo-50 text-indigo-700 py-1.5 px-3 rounded-lg border border-indigo-100">
                    {participants.length} Leerlingen Actief
                  </span>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 h-full overflow-hidden items-stretch">
                  <div className="col-span-8 h-full min-h-0 flex flex-col">
                    <ActiveStudentsList 
                      participants={participants}
                      onRemoveParticipant={actions.removeParticipant}
                      onUpdateParticipant={actions.updateParticipant}
                      onSendPrivateMessage={actions.sendPrivateMessage}
                    />
                  </div>
                  <div className="col-span-4 h-full overflow-y-auto space-y-4 pr-1">
                    <div className="bg-slate-800 text-white backdrop-blur-xl rounded-2xl p-5 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700/30 rounded-bl-full pointer-events-none"></div>
                      <div className="relative z-10">
                        <ClassManagement 
                          isLocked={session.is_locked}
                          onToggleLock={actions.toggleLock}
                          isHelpQuestionsEnabled={session.help_questions_enabled !== 0}
                          onToggleHelpQuestions={actions.toggleHelpQuestions}
                          onSetTimer={actions.setTimer}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        <PromptModal 
          isOpen={showPromptModal}
          type={promptType}
          initialText={newPromptText}
          onClose={() => setShowPromptModal(false)}
          onSubmit={handleSubmitPrompt}
        />

        {showWidgetSelector && (
          <WidgetSelector 
            onClose={() => setShowWidgetSelector(false)} 
            onAddWidget={actions.handleAddWidget} 
          />
        )}
      </div>
    );
  }

  // Pre-session setup view
  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col items-center p-4 relative">
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <GridBackground />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="w-full max-w-4xl mb-4 mt-8 flex justify-between items-center px-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar start
        </button>
        <button
          onClick={handleSignOut}
          className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          Uitloggen / Ander account
        </button>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Bezig met opslaan...</p>
        </div>
      ) : printModePrep ? (
        <PrintableLessonPlan prep={printModePrep} onBack={() => setPrintModePrep(null)} />
      ) : isEditingPrep ? (
        <LessonPreparationForm 
          initialValue={parsedPrep || emptyLessonPreparation} 
          onSave={handleSavePrep} 
          onChoosePrint={setPrintModePrep}
          onCancel={() => setIsEditingPrep(false)}
        />
      ) : (
        <LessonPreparationForm 
          initialValue={emptyLessonPreparation} 
          onSave={actions.startSession} 
          onChoosePrint={setPrintModePrep}
          onCancel={() => navigate('/')}
        />
      )}
    </div>
  );
}
