import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Wrench } from 'lucide-react';
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
import { ClassStats } from '../components/ClassStats';
import { LiveFeed } from '../components/LiveFeed';
import { PromptModal } from '../components/PromptModal';

export function TeacherClassroomPage() {
  const navigate = useNavigate();
  
  const {
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
  const [showAllTools, setShowAllTools] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptType, setPromptType] = useState<PromptType>('CHECK_QUESTION');
  const [newPromptText, setNewPromptText] = useState('');

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
    }
  };

  const parsedPrep: LessonPreparation | null = session?.prep_json ? JSON.parse(session.prep_json) : null;
  const activePhaseSummary = summaries.find(s => s.phase === session?.active_phase);

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <SessionHeader 
          session={session} 
          onOpenWidgets={() => setShowWidgetSelector(true)} 
        />

        {/* Widgets Overlay */}
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {JSON.parse(session.widgets_json || '[]').map((widget: WidgetInstance) => (
            <div key={widget.id} className="pointer-events-auto absolute" style={{ width: '100%', height: '100%' }}>
              <WidgetRenderer 
                widget={widget} 
                isTeacher={true} 
                onUpdate={actions.handleUpdateWidget}
                onRemove={actions.handleRemoveWidget}
              />
            </div>
          ))}
        </div>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <PhaseControls 
              activePhase={session.active_phase} 
              onChangePhase={actions.changePhase} 
            />

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
              
              <QuickActions 
                parsedPrep={parsedPrep}
                activePhase={session.active_phase}
                showAllTools={showAllTools}
                hasActivePrompt={!!activePrompt}
                onOpenPrompt={handleOpenPrompt}
              />

              <InterventionTools 
                activePhase={session.active_phase}
                showAllTools={showAllTools}
                hasActivePrompt={!!activePrompt}
                hasParticipants={participants.length > 0}
                onOpenPrompt={handleOpenPrompt}
                onPickRandomName={actions.pickRandomName}
              />
            </div>

            <ClassManagement 
              isLocked={session.is_locked}
              onToggleLock={actions.toggleLock}
              onSetTimer={actions.setTimer}
            />

            <ActiveStudentsList 
              participants={participants}
              onRemoveParticipant={actions.removeParticipant}
            />

            <button 
              onClick={actions.endSession}
              className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Les Beëindigen
            </button>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {activePrompt && (
              <ActivePromptCard 
                activePrompt={activePrompt}
                signals={signals}
                participants={participants}
                sharedSignalId={session.shared_signal_id}
                onClosePrompt={() => actions.closePrompt(activePrompt.id)}
                onShareSignal={actions.shareSignal}
              />
            )}

            <AiSummaryCard 
              activePhaseSummary={activePhaseSummary}
              generatingSummary={actions.generatingSummary}
              onGenerateSummary={actions.generateSummary}
            />

            <ClassStats 
              participants={participants}
              signals={signals}
              activePhase={session.active_phase}
            />

            <LiveFeed 
              signals={signals}
              participants={participants}
              sharedSignalId={session.shared_signal_id}
              onShareSignal={actions.shareSignal}
            />
          </div>
        </main>

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl mb-4 mt-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar start
        </button>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Bezig met starten van de les...</p>
        </div>
      ) : (
        <LessonPreparationForm 
          initialValue={emptyLessonPreparation} 
          onSave={actions.startSession} 
          onCancel={() => navigate('/')}
        />
      )}
    </div>
  );
}
