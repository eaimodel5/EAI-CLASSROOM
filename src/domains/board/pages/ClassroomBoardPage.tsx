import React from 'react';
import { useParams } from 'react-router-dom';
import { useBoardSession } from '../hooks/useBoardSession';
import { BoardHeader } from '../components/BoardHeader';
import { BoardActivePrompt } from '../components/BoardActivePrompt';
import { BoardSharedSignal } from '../components/BoardSharedSignal';
import { WidgetRenderer } from '../../../components/widgets/WidgetRenderer';
import { WidgetInstance } from '../../../components/widgets/WidgetRegistry';
import GridBackground from '../../../components/GridBackground';

export function ClassroomBoardPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  
  const {
    session,
    participants,
    activePrompt,
    signals,
    allSignals,
    loading,
    error
  } = useBoardSession(sessionCode);

  if (loading) {
    return <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center text-gray-500">Laden...</div>;
  }

  if (error || !session) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Oeps!</h1>
          <p className="text-lg text-gray-600">{error || 'Sessie niet gevonden'}</p>
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

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-500 bg-transparent relative`}>
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <GridBackground />
        <div className={`absolute inset-0 transition-colors duration-500 ${getPhaseStyles()} opacity-80 backdrop-blur-[2px]`}></div>
      </div>

      <BoardHeader session={session} />

      <main className="flex-1 flex flex-col p-6 max-w-[1400px] mx-auto w-full relative">
        <div className="w-full h-full flex flex-col lg:flex-row gap-8 items-stretch pt-4">
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            {activePrompt ? (
              <BoardActivePrompt
                activePrompt={activePrompt}
                signals={signals}
                sharedSignalId={session.shared_signal_id}
                allSignals={allSignals}
              />
            ) : (
              <BoardSharedSignal
                session={session}
                signals={signals}
                allSignals={allSignals}
              />
            )}
          </div>

          {JSON.parse(session.widgets_json || '[]').length > 0 && (
            <div className="w-full lg:w-[420px] flex flex-col gap-5 max-h-[calc(100vh-140px)] overflow-y-auto hide-scrollbar shrink-0 px-2 lg:px-4 lg:border-l border-slate-300/30 pt-6 lg:pt-0">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left mb-2">Bord Hulpmiddelen</h3>
              {JSON.parse(session.widgets_json || '[]').map((widget: WidgetInstance) => (
                <WidgetRenderer 
                  key={widget.id}
                  widget={widget} 
                  participants={participants}
                  isTeacher={false} 
                  inlineMode={true}
                  session={session}
                  signals={allSignals}
                  className="w-full shadow-2xl shadow-slate-200/40 bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden transform transition-all hover:scale-[1.01]"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
