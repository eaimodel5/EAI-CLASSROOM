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

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-500 bg-transparent relative`}>
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <GridBackground />
        <div className={`absolute inset-0 transition-colors duration-500 ${getPhaseStyles()} opacity-80 backdrop-blur-[2px]`}></div>
      </div>

      <BoardHeader session={session} />

      <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-7xl mx-auto w-full relative">
        <div className="grid grid-cols-12 gap-8 w-full h-full items-center">
          <div className={`col-span-12 ${JSON.parse(session.widgets_json || '[]').length > 0 ? 'lg:col-span-8 lg:pr-8' : ''} flex flex-col items-center justify-center w-full h-full`}>
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
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 w-full max-h-full">
              {JSON.parse(session.widgets_json || '[]').map((widget: WidgetInstance) => (
                <WidgetRenderer 
                  key={widget.id}
                  widget={widget} 
                  participants={participants}
                  isTeacher={false} 
                  inlineMode={true}
                  className="w-full shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md min-h-[300px] border border-white"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
