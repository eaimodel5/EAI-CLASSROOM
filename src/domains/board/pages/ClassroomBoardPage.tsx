import React from 'react';
import { useParams } from 'react-router-dom';
import { useBoardSession } from '../hooks/useBoardSession';
import { BoardHeader } from '../components/BoardHeader';
import { BoardActivePrompt } from '../components/BoardActivePrompt';
import { BoardSharedSignal } from '../components/BoardSharedSignal';
import { WidgetRenderer } from '../../../components/widgets/WidgetRenderer';
import { WidgetInstance } from '../../../components/widgets/WidgetRegistry';

export function ClassroomBoardPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  
  const {
    session,
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
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-500 ${getPhaseStyles()}`}>
      <BoardHeader session={session} />

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
      </main>
    </div>
  );
}
