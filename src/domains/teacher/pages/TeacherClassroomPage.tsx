import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Radio, Sparkles, Sliders, 
  ChevronLeft, ChevronRight, Lock, Unlock, HelpCircle, LogOut 
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { emptyLessonPreparation, LessonPreparation } from '../../../types';
import { WidgetSelector } from '../../../components/widgets/WidgetSelector';
import { LessonPreparationForm } from '../../../components/LessonPreparationForm';

import { useTeacherSession } from '../hooks/useTeacherSession';
import { useTeacherActions } from '../hooks/useTeacherActions';
import { PromptType } from '../types';

import { SessionHeader } from '../components/SessionHeader';
import { QuickActions } from '../components/QuickActions';
import { InterventionTools } from '../components/InterventionTools';
import { ClassManagement } from '../components/ClassManagement';
import { ActivePromptCard } from '../components/ActivePromptCard';
import { TeacherProposalCard } from '../components/TeacherProposalCard';
import { LiveFeed } from '../components/LiveFeed';
import { PromptModal } from '../components/PromptModal';
import { PrintableLessonPlan } from '../components/PrintableLessonPlan';

const createTheme = (accent: string, bg: string) => ({
  '--color-indigo-50': `var(--color-${accent}-50)`,
  '--color-indigo-100': `var(--color-${accent}-100)`,
  '--color-indigo-200': `var(--color-${accent}-200)`,
  '--color-indigo-300': `var(--color-${accent}-300)`,
  '--color-indigo-400': `var(--color-${accent}-400)`,
  '--color-indigo-500': `var(--color-${accent}-500)`,
  '--color-indigo-600': `var(--color-${accent}-600)`,
  '--color-indigo-700': `var(--color-${accent}-700)`,
  '--color-indigo-800': `var(--color-${accent}-800)`,
  '--color-indigo-900': `var(--color-${accent}-900)`,
  '--color-indigo-950': `var(--color-${accent}-950)`,
  
  '--color-slate-50': `var(--color-${bg}-50)`,
  '--color-slate-100': `var(--color-${bg}-100)`,
  '--color-slate-200': `var(--color-${bg}-200)`,
  '--color-slate-300': `var(--color-${bg}-300)`,
  '--color-slate-400': `var(--color-${bg}-400)`,
  '--color-slate-500': `var(--color-${bg}-500)`,
  '--color-slate-600': `var(--color-${bg}-600)`,
  '--color-slate-700': `var(--color-${bg}-700)`,
  '--color-slate-800': `var(--color-${bg}-800)`,
  '--color-slate-900': `var(--color-${bg}-900)`,
  '--color-slate-950': `var(--color-${bg}-950)`,
});

const THEMES = {
  indigo: null,
  teal: createTheme('teal', 'cyan'),
  rose: createTheme('rose', 'stone'),
  amber: createTheme('amber', 'orange'),
  emerald: createTheme('emerald', 'teal')
};

export function TeacherClassroomPage() {
  const navigate = useNavigate();
  const [themeName, setThemeName] = useState<keyof typeof THEMES>('indigo');
  
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

  // Gelaagdheid: Panel-statussen (Standaard compact/open afhankelijk van focus)
  const [leftPanelExpanded, setLeftPanelExpanded] = useState(true);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  
  // Systeem statussen
  const [showAllTools, setShowAllTools] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('CHECK_QUESTION');
  const [newPromptText, setNewPromptText] = useState('');
  const [printModePrep, setPrintModePrep] = useState<LessonPreparation | null>(null);
  const [isEditingPrep, setIsEditingPrep] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  const parsedPrep: LessonPreparation | null = session?.prep_json ? JSON.parse(session.prep_json) : null;
  const activePhaseProposals = session ? proposals.filter((p: any) => p.phase === session.active_phase && p.status !== 'DISMISSED') : [];

  const getDynamicPrefill = (type: PromptType): string => {
    // 1. Eerst checken of er een onlangs gegenereerd, niet-afgewezen AI voorstel is dat bij dit prompttype past
    if (session) {
      const matchingProposal = proposals.find(p => 
        p.phase === session.active_phase && 
        p.status !== 'DISMISSED' &&
        p.suggested_activity?.prompt_type === type &&
        p.suggested_activity?.prompt_text
      );
      if (matchingProposal && matchingProposal.suggested_activity?.prompt_text) {
        return matchingProposal.suggested_activity.prompt_text;
      }
    }

    // 2. Zo niet, val terug op de uiterst gedetailleerde voorbereide leskaart (parsedPrep)
    if (!parsedPrep) return '';

    switch (type) {
      case 'PRIOR_KNOWLEDGE':
        return parsedPrep.priorKnowledgeQuestions?.find(q => q && q.trim()) || 
               (parsedPrep.title ? `Bespreek met je buurman/buurvrouw: wat herinner je je nog van ons onderwerp '${parsedPrep.title}'? Schrijf de belangrijkste 2 punten op.` : "Wat weet je al over dit onderwerp? Schrijf het op!");
      
      case 'DIAGNOSTIC':
        return parsedPrep.instructionActivities?.find(q => q && q.trim()) || 
               (parsedPrep.learningGoal ? `We kijken naar ons leerdoel: '${parsedPrep.learningGoal}'. Welke stap in de uitleg of berekening is volgens jou het meest uitdagend?` : "Diagnostische check: Wat vind je tot nu toe het meest onduidelijk?");
      
      case 'MISCONCEPTION': {
        const mis = parsedPrep.misconceptions?.find(q => q && q.trim());
        if (mis) {
          return `Stelling: "Sommige mensen denken: ${mis}". Waarom is dit een misconceptie? Leg in je eigen woorden uit hoe het wél zit.`;
        }
        return `We horen vaak een verkeerde aanname over ons onderwerp '${parsedPrep.title || 'dit onderwerp'}'. Wat is de meest logische denkfout hierbij en waarom klopt die niet?`;
      }
      
      case 'GO_NO_GO':
        return `Formatieve Check: Zijn we klaar om zelfstandig aan de slag te gaan met de verwerkingsopdracht over '${parsedPrep.learningGoal || parsedPrep.title || 'dit onderwerp'}'?\n\nA) Ja, ik kan direct en zelfstandig starten.\nB) Ja, maar ik heb nog een korte hint of opstart-vraag nodig.\nC) Nee, ik wil heel graag nog wat extra uitleg of begeleiding van de docent.`;
      
      case 'CONFIDENCE':
        return `Confidence Check: Hoe zeker voel jij je over de stof en het behalen van het leerdoel: '${parsedPrep.learningGoal || parsedPrep.title || 'dit onderwerp'}'?\n\nGeef een cijfer van 1 (zeer onzeker) tot 10 (volledig overtuigd) en geef kort aan wat je helpt om dit cijfer te verhogen.`;
      
      case 'CHECK_QUESTION':
        return parsedPrep.checkQuestions?.find(q => q && q.trim()) || 
               `Checkvraag over ons leerdoel: Leg in je eigen woorden uit wat de belangrijkste regel of verklaring is die we zojuist hebben behandeld.`;
      
      case 'HINT':
        return parsedPrep.interventions?.find(q => q && q.trim()) || 
               `💡 Hulp & Hint bij de verwerking:\nDenk bij de opgaven goed aan de succescriteria! Werk stap voor stap en controleer je tussenberekeningen.`;
      
      case 'CLASS_INTERVENTION': {
        const hint = parsedPrep.interventions?.filter(q => q && q.trim())[1] || parsedPrep.interventions?.find(q => q && q.trim());
        if (hint) {
          return `⚠️ Klassikale Interventie:\nLaat alles even los en let goed op. Er is een belangrijk aandachtspunt bij deze opdracht:\n\n"${hint}"`;
        }
        return `⚠️ Klassikale Interventie:\nIk zie dat we tegen een gezamenlijk obstakel aanlopen bij '${parsedPrep.learningGoal || parsedPrep.title}'. Laten we hier samen even kort bij stilstaan.`;
      }
      
      case 'PEER_FEEDBACK': {
        const crit = parsedPrep.successCriteria?.find(s => s && s.trim());
        return `👥 Peer Feedbackmoment:\nWissel je uitwerking of antwoord uit met je schoudermaatje. Geef elkaar feedback op basis van ons succescriterium:\n\n"${crit || 'De nauwkeurigheid en logica van de stappen'}"\n\nSchrijf voor elkaar op:\n- 1 TOP (wat gaat al perfect?)\n- 1 TIP (wat kan nog net iets scherper?)`;
      }
      
      case 'EXIT_TICKET':
        return parsedPrep.exitTicketQuestions?.find(q => q && q.trim()) || 
               `Exit Ticket: Formuleer in 1 of 2 zinnen het antwoord op de kernvraag: Hoe weet je of je het leerdoel van vandaag hebt behaald?`;
      
      case 'REFLECTION': {
        const goal = parsedPrep.learningGoal || parsedPrep.title;
        return `Reflectieprompt:\nKijk kritisch naar je eigen inzet en leerproces vandaag rondom:\n"${goal}"\n\nWelke specifieke actie of gedachte hielp jou vandaag het meest vooruit? En wat neem je mee naar de volgende les?`;
      }
      
      default:
        return '';
    }
  };

  const handleOpenPrompt = (type: PromptType, text: string) => {
    setPromptType(type);
    if (!text) {
      setNewPromptText(getDynamicPrefill(type));
    } else {
      setNewPromptText(text);
    }
    setShowPromptModal(true);
  };

  const handleSubmitPrompt = async (type: PromptType, text: string) => {
    const success = await actions.createPrompt(type, text);
    if (success) {
      setShowPromptModal(false);
      setNewPromptText('');
    }
  };

  const handleSavePrep = async (prep: LessonPreparation) => {
    await actions.updateSessionPrep(prep);
    setIsEditingPrep(false);
  };

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
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-xs text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div className="font-bold tracking-tight">CONNECTING TO FIRESTORE STREAM...</div>
      </div>
    );
  }

  if (session && !isEditingPrep) {
    const activeTheme = THEMES[themeName];
    
    return (
      <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden antialiased font-sans text-[12px] select-none">
        
        {activeTheme && (
          <style>
            {`
              :root {
                ${Object.entries(activeTheme).map(([k, v]) => `${k}: ${v};`).join('\n')}
              }
            `}
          </style>
        )}

        {/* TOP LEVEL BAR: Ruimer formaat */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 overflow-hidden shadow-sm">
          <div className="flex items-center gap-4">
            <span className="font-black text-sm tracking-widest text-white bg-indigo-600 px-2 py-1 rounded">EAI</span>
            <SessionHeader 
              session={session} 
              onOpenWidgets={() => setShowWidgetSelector(true)} 
              onEditPrep={() => setIsEditingPrep(true)}
            />
          </div>
          
          {/* Real-time Status indicators */}
          <div className="flex items-center gap-3 text-xs">
            {/* Theme Selector */}
            <div className="flex bg-slate-950 rounded border border-slate-800 p-1 gap-1">
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map(t => (
                <button
                  key={t}
                  onClick={() => setThemeName(t)}
                  title={`Thema: ${t}`}
                  className={`w-4 h-4 rounded-sm cursor-pointer transition-transform ${themeName === t ? 'scale-110 ring-2 ring-white/50' : 'hover:scale-110 opacity-70 hover:opacity-100'} ${
                    t === 'indigo' ? 'bg-indigo-500' :
                    t === 'teal' ? 'bg-teal-500' :
                    t === 'rose' ? 'bg-rose-500' :
                    t === 'emerald' ? 'bg-emerald-500' :
                    'bg-amber-500'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-slate-400 font-bold">{participants.length} LN</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Uitloggen"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* FASE CONTROLLER: Compacte grid-strook direct onder de header */}
        <nav className="bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0 flex items-center gap-4 overflow-x-auto custom-scrollbar flex-nowrap shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Fase:</span>
          </div>
          <div className="flex-1 max-w-2xl grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded border border-slate-800 shrink-0 min-w-[400px]">
            {['START', 'INSTRUCTIE', 'CHECK', 'VERWERKEN', 'AFSLUITING'].map((phaseKey) => {
              const isSelected = session.active_phase === phaseKey;
              return (
                <button
                  key={phaseKey}
                  onClick={() => actions.changePhase(phaseKey as any)}
                  className={`py-1.5 px-2 rounded-sm text-center transition-all cursor-pointer text-xs font-bold truncate ${
                    isSelected 
                      ? 'bg-indigo-600 text-white font-black shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {phaseKey}
                </button>
              );
            })}
          </div>
        </nav>

        {/* INTERFACE CORE: 3-Koloms Matrix met High-Density Layering */}
        <main className="flex-1 w-full flex flex-row min-h-0 overflow-hidden bg-slate-950 relative">
          
          {/* KOLOM 1: GEREEDSCHAP & IMPULSEN (Inklapbaar) */}
          <section 
            className={`h-full flex flex-col min-h-0 bg-slate-900 border-r border-slate-800 transition-all duration-150 absolute md:relative z-20 ${
              leftPanelExpanded ? 'w-[280px]' : 'w-[40px]'
            }`}
          >
            {/* Minimalistische Toggle header */}
            <div className="h-10 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between px-2 shrink-0 select-none">
              {leftPanelExpanded && (
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 px-1">
                  <Sliders className="w-4 h-4 text-indigo-400" /> Gereedschap
                </span>
              )}
              <button 
                onClick={() => setLeftPanelExpanded(!leftPanelExpanded)}
                className="w-6 h-6 ml-auto flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 rounded-sm cursor-pointer text-sm font-bold transition-colors"
                title={leftPanelExpanded ? 'Inklappen' : 'Uitklappen'}
              >
                {leftPanelExpanded ? '−' : '+'}
              </button>
            </div>

            {/* Inhoud Kolom 1 */}
            {leftPanelExpanded ? (
              <div className="flex-1 overflow-y-auto p-1.5 space-y-3 custom-scrollbar">
                {parsedPrep && (
                  <div className="bg-slate-950/50 border border-slate-800 rounded p-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-tight text-indigo-400">Lesplan-items</span>
                      <button 
                        onClick={() => setShowAllTools(!showAllTools)}
                        className="text-[9px] px-1 bg-slate-900 border border-slate-700 rounded-sm text-slate-400 hover:text-slate-200"
                      >
                        {showAllTools ? 'Filter' : 'Alle'}
                      </button>
                    </div>
                    <QuickActions 
                      parsedPrep={parsedPrep}
                      activePhase={session.active_phase}
                      showAllTools={showAllTools}
                      hasActivePrompt={!!activePrompt}
                      onOpenPrompt={handleOpenPrompt}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 block px-0.5">Live Interventies</span>
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
            ) : (
              /* Compacte verticale icon-strip wanneer ingeklapt */
              <div className="flex-1 flex flex-col items-center pt-2 gap-3 text-slate-600">
                <span className="text-[9px] font-black tracking-widest uppercase rotate-90 my-4 origin-left whitespace-nowrap text-slate-500">GEREEDSCHAP</span>
              </div>
            )}
          </section>

          {/* KOLOM 2: NUCLEUS / DATA-CENTER (Schakelt dynamisch of toont split) */}
          <section className="flex-1 h-full flex flex-col min-h-0 bg-slate-950 border-r border-slate-800 pl-[40px] md:pl-0 pr-[40px] md:pr-0">
            {activePrompt ? (
              /* INTERACTIE-MODUS: Er staat een vraag open */
              <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-100">
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>Interactie Live op schermen</span>
                  </div>
                  <button
                    onClick={() => actions.closePrompt(activePrompt.id)}
                    className="text-xs font-black bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-sm shadow-sm transition-colors cursor-pointer"
                  >
                    Sluit Vraag & Haal van bord
                  </button>
                </div>
                <div className="flex-1 min-h-0 p-1 overflow-y-auto custom-scrollbar">
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
              /* MONITORING-MODUS: Algemene Live-feed */
              <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-100">
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 shrink-0">
                  <Radio className="w-4 h-4 text-indigo-400 mr-2" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Live klasoverzicht & voortgang feed</span>
                </div>
                <div className="flex-1 min-h-0">
                  <LiveFeed 
                    signals={signals}
                    participants={participants}
                    sharedSignalId={session.shared_signal_id}
                    onShareSignal={actions.shareSignal}
                  />
                </div>
              </div>
            )}
          </section>

          {/* KOLOM 3: ANALYSE & HARDWARE BEHEER (Inklapbaar) */}
          <section 
            className={`h-full flex flex-col min-h-0 bg-slate-900 border-l border-slate-800 transition-all duration-150 absolute md:relative right-0 z-20 ${
              rightPanelExpanded ? 'w-[280px]' : 'w-[40px]'
            }`}
          >
            {/* Header met inline +/- regie */}
            <div className="h-10 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between px-2 shrink-0 select-none">
              <button 
                onClick={() => setRightPanelExpanded(!rightPanelExpanded)}
                className="w-6 h-6 mr-2 flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 rounded-sm cursor-pointer text-sm font-bold transition-colors"
                title={rightPanelExpanded ? 'Inklappen' : 'Uitklappen'}
              >
                {rightPanelExpanded ? '−' : '+'}
              </button>
              {rightPanelExpanded && (
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 mr-auto px-1">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Analyse & Regie
                </span>
              )}
            </div>

            {/* Inhoud Kolom 3 */}
            {rightPanelExpanded ? (
              <div className="flex-1 overflow-y-auto p-1.5 space-y-2.5 custom-scrollbar">
                
                {/* AI-Assistent container (Super compact) */}
                <div className="bg-slate-950/40 border border-slate-800 rounded p-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-tight text-indigo-400">Real-time AI</span>
                    <button
                      onClick={() => actions.generateTeacherProposal(signals, participants, 'PHASE_BRIEFING')}
                      disabled={actions.generatingSummary}
                      className="text-[9px] px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-sm disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      {actions.generatingSummary ? 'Scant...' : 'Scan klas'}
                    </button>
                  </div>
                  
                  <div className="space-y-1 max-h-[160px] overflow-y-auto pr-0.5 custom-scrollbar">
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
                      <div className="text-[10px] text-slate-600 text-center py-4 border border-dashed border-slate-800 rounded bg-slate-950/20 px-1">
                        Druk op 'Scan klas' voor live suggesties.
                      </div>
                    )}
                  </div>
                </div>

                {/* Systeembeheer & Noodknoppen */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 block px-0.5">Lock & Timer</span>
                  <div className="bg-slate-950/40 border border-slate-800 rounded p-1">
                    <ClassManagement 
                      isLocked={session.is_locked}
                      onToggleLock={actions.toggleLock}
                      isHelpQuestionsEnabled={session.help_questions_enabled !== 0}
                      onToggleHelpQuestions={actions.toggleHelpQuestions}
                      onSetTimer={actions.setTimer}
                    />
                  </div>
                </div>

                {/* Direct Beëindigen Knop */}
                <button 
                  onClick={actions.endSession}
                  className="w-full py-1 text-[11px] bg-slate-950 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 font-bold rounded border border-slate-800 hover:border-rose-900 transition-all cursor-pointer text-center"
                >
                  Beëindig Lessessie
                </button>

              </div>
            ) : (
              /* Compacte verticale icon-strip wanneer ingeklapt */
              <div className="flex-1 flex flex-col items-center pt-2 gap-3 text-slate-600">
                <span className="text-[9px] font-black tracking-widest uppercase rotate-90 my-4 origin-left whitespace-nowrap text-slate-500">ANALYSE & REGIE</span>
              </div>
            )}
          </section>

        </main>

        {/* COMPACTE MODALS */}
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

  {/* PRE-SESSION CONFIGURATOR (Wordt alleen getoond als er geen actieve Firestore-sessie is) */}
  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 antialiased font-sans text-xs">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 shadow-xl rounded p-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-slate-400 hover:text-slate-200 font-bold text-[11px]">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </button>
          <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">EAI CONFIGURATOR</span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-slate-500 font-bold text-[11px] tracking-tight">FIRESTORE MUTATIE BEZIG...</p>
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
    </div>
  );
}
