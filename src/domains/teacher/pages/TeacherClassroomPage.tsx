import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Wrench, MessagesSquare, LayoutGrid, LayoutDashboard, Zap, Activity, Users, Radio, PanelRightClose } from 'lucide-react';
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
    setLoading
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
    // We could update Firestore here: await updateDoc(doc(db, \`classroom_sessions/\${session!.id}/proposals\`, id), { status: 'DISMISSED' })
    // For now, let's keep it simple if we want UI dismiss
  };

  if (session && !isEditingPrep) {
    const activeWidgets = JSON.parse(session.widgets_json || '[]');

    return (
      <div className="min-h-[100dvh] bg-transparent flex flex-col relative overflow-hidden">
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <GridBackground />
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm"></div>
        </div>

        <SessionHeader 
          session={session} 
          onOpenWidgets={() => setShowWidgetSelector(true)} 
          onEditPrep={() => setIsEditingPrep(true)}
        />

        <div className="flex-1 w-full mx-auto flex flex-col lg:flex-row min-h-0">
          {/* Main Content Workspace */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto relative z-0 hide-scrollbar scroll-smooth w-full">
            
            {/* OVERVIEW MODULE */}
            {activeModule === 'OVERVIEW' && (
              <div className="space-y-8 max-w-[1600px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-2">Control Center</h1>
                  <p className="text-slate-500 font-medium text-base">Stuur je les en bekijk live statistieken over de klas.</p>
                </div>

                <ClassStats 
                  participants={participants}
                  signals={signals}
                  activePhase={session.active_phase}
                />

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200/60">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Activity className="w-4 h-4" /> Lesfase Controller
                      </h3>
                      <PhaseControls 
                        activePhase={session.active_phase} 
                        onChangePhase={actions.changePhase} 
                      />
                    </div>
                  </div>
                  
                  <div className="xl:col-span-8 flex flex-col h-full">
                    <div className="flex justify-between items-end mb-4">
                       <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <LayoutGrid className="w-4 h-4" /> Actieve Bord Tools
                       </h3>
                       <button onClick={() => setShowWidgetSelector(true)} className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">+ Toevoegen</button>
                    </div>
                    {activeWidgets.length > 0 ? (
                      <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-5 flex-1 min-h-[220px]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                          {activeWidgets.map((widget: WidgetInstance) => (
                            <WidgetRenderer 
                              key={widget.id}
                              widget={widget} 
                              participants={participants}
                              isTeacher={true} 
                              inlineMode={true}
                              onUpdate={actions.handleUpdateWidget}
                              onRemove={actions.handleRemoveWidget}
                              session={session}
                              signals={signals}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/40 backdrop-blur-md border-2 border-dashed border-slate-200/80 rounded-2xl p-6 text-center flex-1 flex flex-col justify-center items-center text-slate-500 min-h-[220px]">
                        <div className="w-20 h-20 bg-slate-100/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-200/50 transform rotate-3">
                          <LayoutGrid className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="font-bold text-xl text-slate-700">Geen tools geactiveerd</p>
                        <p className="font-medium mt-2 max-w-md">Kies uit o.a. een timer, quizzen of media om direct theorie op het grote bord te toveren.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI & INTERACTIES MODULE */}
            {activeModule === 'INTERACTIONS' && (
              <div className="space-y-8 max-w-[1600px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-2">AI & Interacties</h1>
                    <p className="text-slate-500 font-medium text-base">Activeer de klas met AI-gedreven werkvormen en reflecties.</p>
                  </div>
                  {activePrompt && (
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold border border-indigo-200 shadow-sm animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Active Prompt Running
                    </div>
                  )}
                </div>

                {activePrompt && (
                  <div className="mb-10 w-full animate-in slide-in-from-top-4 duration-500">
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

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-12">
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-slate-800">Didactische Voorstellen (AI)</h3>
                       <button
                         onClick={() => actions.generateTeacherProposal(signals, participants, 'PHASE_BRIEFING')}
                         disabled={actions.generatingSummary}
                         className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-sm"
                       >
                         {actions.generatingSummary ? 'Bezig met analyseren...' : 'Genereer nieuw voorstel'}
                       </button>
                     </div>
                     {activePhaseProposals.length > 0 ? (
                       activePhaseProposals.map((proposal) => (
                         <TeacherProposalCard
                           key={proposal.id}
                           proposal={proposal}
                           onStartAction={actions.startTeacherAction}
                           onDismiss={handleDismissProposal}
                         />
                       ))
                     ) : (
                       <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center text-indigo-800">
                         Nog geen specifieke voorstellen voor deze lesfase.
                       </div>
                     )}
                  </div>
                
                  <div className="xl:col-span-12 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-4 md:p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-full -mr-32 -mt-32 z-0 mix-blend-multiply opacity-50 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4 border-b border-slate-100 pb-6">
                        <div>
                          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                            <span className="w-10 h-10 bg-indigo-100/50 rounded-xl flex items-center justify-center border border-indigo-200 flex-shrink-0">
                               <Zap className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                            </span>
                            Lesfase: {
                              session.active_phase === 'START' ? 'Start (Voorkennis)' :
                              session.active_phase === 'INSTRUCTIE' ? 'Instructiefase' :
                              session.active_phase === 'VERWERKEN' ? 'Verwerking' :
                              session.active_phase === 'CHECK' ? 'Formatieve Check' :
                              session.active_phase === 'AFSLUITING' ? 'Lekker Afsluiten' : 'Overig'
                            }
                          </h2>
                          <p className="text-slate-500 mt-2 font-medium max-w-lg leading-relaxed">
                            Kies direct acties die horen bij dit onderdeel van de les.
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowAllTools(!showAllTools)}
                          className="text-sm font-bold bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-slate-50 hover:border-indigo-200 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap active:scale-95 shadow-sm"
                        >
                          {showAllTools ? 'Toon alleen huidige fase' : 'Toon werkvormen per fase'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-slate-50/50 rounded-2xl p-4 md:p-5 border-2 border-slate-100">
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Werkvorm</h3>
                          <InterventionTools 
                            activePhase={session.active_phase}
                            showAllTools={showAllTools}
                            hasActivePrompt={!!activePrompt}
                            hasParticipants={participants.length > 0}
                            onOpenPrompt={handleOpenPrompt}
                            onPickRandomName={actions.pickRandomName}
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 pl-2 hidden md:block">Leskaart</h3>
                          <QuickActions 
                            parsedPrep={parsedPrep}
                            activePhase={session.active_phase}
                            showAllTools={showAllTools}
                            hasActivePrompt={!!activePrompt}
                            onOpenPrompt={handleOpenPrompt}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE MONITOR MODULE */}
            {activeModule === 'MONITOR' && (
              <div className="space-y-6 max-w-[1400px] w-full mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-2">Live Monitor</h1>
                  <p className="text-slate-500 font-medium text-base">Een continue stroom van leerling-signalen direct vanaf hun schermen.</p>
                </div>

                <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 p-2 overflow-hidden flex flex-col min-h-[400px]">
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
              <div className="space-y-6 max-w-[1400px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight mb-2">Klas & Beheer</h1>
                    <p className="text-slate-500 font-medium text-base">Overzicht van alle ingelogde leerlingen en veiligheidsopties.</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-800 px-5 py-2.5 rounded-xl font-bold flex items-center gap-3 border border-indigo-100 shadow-sm">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <span className="text-lg">{participants.length} Actief</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-8">
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden h-full">
                      <ActiveStudentsList 
                        participants={participants}
                        onRemoveParticipant={actions.removeParticipant}
                        onUpdateParticipant={actions.updateParticipant}
                        onSendPrivateMessage={actions.sendPrivateMessage}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4 space-y-4">
                    <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-slate-700/50 rounded-bl-full -mr-24 -mt-24 transition-transform group-hover:scale-110"></div>
                      <ClassManagement 
                        isLocked={session.is_locked}
                        onToggleLock={actions.toggleLock}
                        onSetTimer={actions.setTimer}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* Sidebar Navigation */}
          <div className={`transition-all duration-300 ease-in-out shrink-0 bg-white/95 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-slate-200/80 flex flex-col gap-4 md:gap-5 lg:h-full z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] ${
            isSidebarOpen ? 'w-full lg:w-60 p-4 md:p-5' : 'w-full lg:w-16 p-3 md:p-4'
          }`}>
            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 md:space-6 flex flex-col">
              <div className="flex justify-between items-center hidden lg:flex">
                {isSidebarOpen && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 select-none">App Modules</span>}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mx-auto">
                   <PanelRightClose className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
                </button>
              </div>
              <div>
                <h3 className={`hidden lg:block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-4 select-none ${isSidebarOpen ? '' : 'hidden lg:hidden'}`}>App Modules</h3>
                <nav className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar lg:overflow-x-visible pb-2 lg:pb-0">
                  <button 
                    onClick={() => setActiveModule('OVERVIEW')} 
                    title="Control Center"
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 ${
                      activeModule === 'OVERVIEW' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 lg:translate-x-[-8px]' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    } ${!isSidebarOpen && 'lg:justify-center'}`}
                  >
                    <LayoutDashboard className={`w-5 h-5 shrink-0 ${activeModule === 'OVERVIEW' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`transition-all duration-300 lg:block ${isSidebarOpen ? 'opacity-100 w-auto' : 'lg:hidden opacity-0 w-0 overflow-hidden'}`}>Control Center</span>
                  </button>
                  <button 
                    onClick={() => setActiveModule('INTERACTIONS')}
                    title="AI & Interacties" 
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 relative ${
                      activeModule === 'INTERACTIONS' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 lg:translate-x-[-8px]' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    } ${!isSidebarOpen && 'lg:justify-center'}`}
                  >
                    <Zap className={`w-5 h-5 shrink-0 ${activeModule === 'INTERACTIONS' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`transition-all duration-300 lg:block ${isSidebarOpen ? 'opacity-100 w-auto' : 'lg:hidden opacity-0 w-0 overflow-hidden'}`}>AI & Interacties</span>
                    {activePrompt && (
                      <span className={`absolute ${isSidebarOpen ? 'right-4' : 'top-1 right-1'} w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]`}></span>
                    )}
                  </button>
                  <button 
                    onClick={() => setActiveModule('MONITOR')} 
                    title="Live Monitor"
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 ${
                      activeModule === 'MONITOR' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 lg:translate-x-[-8px]' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    } ${!isSidebarOpen && 'lg:justify-center'}`}
                  >
                    <Radio className={`w-5 h-5 shrink-0 ${activeModule === 'MONITOR' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`transition-all duration-300 lg:block ${isSidebarOpen ? 'opacity-100 w-auto' : 'lg:hidden opacity-0 w-0 overflow-hidden'}`}>Live Monitor</span>
                  </button>
                  <button 
                    onClick={() => setActiveModule('STUDENTS')}
                    title="Klas & Beheer" 
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 ${
                      activeModule === 'STUDENTS' 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 lg:translate-x-[-8px]' 
                        : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                    } ${!isSidebarOpen && 'lg:justify-center'}`}
                  >
                    <Users className={`w-5 h-5 shrink-0 ${activeModule === 'STUDENTS' ? 'text-indigo-200' : 'text-slate-400'}`} />
                    <span className={`transition-all duration-300 lg:block ${isSidebarOpen ? 'opacity-100 w-auto' : 'lg:hidden opacity-0 w-0 overflow-hidden'}`}>Klas & Beheer</span>
                  </button>
                </nav>
              </div>
            </div>

            <div className={`pt-6 border-t border-slate-200/80 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
              <button 
                onClick={actions.endSession}
                className="w-full py-4 px-4 bg-white hover:bg-red-50 text-red-600 font-bold rounded-[1.25rem] border-2 border-red-100 hover:border-red-200 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 group"
              >
                <XCircle className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span>Les Beëindigen</span>
              </button>
            </div>
          </div>
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
