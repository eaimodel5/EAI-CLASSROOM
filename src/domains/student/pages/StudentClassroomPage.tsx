import React, { useState } from 'react';
import { useStudentSession } from '../hooks/useStudentSession';
import { JoinSessionForm } from '../components/JoinSessionForm';
import { StudentHeader } from '../components/StudentHeader';
import { StudentSignalControls } from '../components/StudentSignalControls';
import { ActivePromptOverlay } from '../components/ActivePromptOverlay';
import { StudentDrawingPad } from '../components/StudentDrawingPad';
import { CheckCircle, PenTool } from 'lucide-react';

export function StudentClassroomPage() {
  const {
    sessionCode, setSessionCode,
    displayName, setDisplayName,
    loading, error,
    session, participant,
    activeSignal, setActiveSignal,
    composingSignal, setComposingSignal,
    signalText, setSignalText,
    activePrompt, promptResponse, setPromptResponse,
    promptSubmitted,
    joinSession, sendSignal
  } = useStudentSession();

  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  // --- JOIN FLOW UI ---
  if (!session || !participant) {
    return (
      <JoinSessionForm
        sessionCode={sessionCode}
        setSessionCode={setSessionCode}
        displayName={displayName}
        setDisplayName={setDisplayName}
        loading={loading}
        error={error}
        onJoin={joinSession}
      />
    );
  }

  // Determine background color based on active phase
  const getPhaseStyles = () => {
    switch (session.active_phase) {
      case 'START': return 'bg-blue-50';
      case 'INSTRUCTIE': return 'bg-amber-50';
      case 'CHECK': return 'bg-orange-50';
      case 'VERWERKEN': return 'bg-emerald-50';
      case 'AFSLUITING': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  if (session.status === 'ENDED') {
    return (
      <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Les is afgelopen</h1>
          <p className="text-gray-600 mb-6">De docent heeft deze sessie beëindigd.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Terug naar start
          </button>
        </div>
      </div>
    );
  }

  const isTimedOut = participant.timeout_until && new Date(participant.timeout_until) > new Date();

  if (isTimedOut) {
    return (
      <div className="min-h-[100dvh] bg-orange-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Even pauze</h1>
          <p className="text-gray-600 mb-6">Je hebt een time-out gekregen van de docent. Je kunt even niet actief deelnemen.</p>
        </div>
      </div>
    );
  }

  if (session.is_locked === 1) {
    return (
      <div className="min-h-[100dvh] bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-widest">Kijk naar de docent</h1>
          <p className="text-gray-400 text-lg">Je scherm is tijdelijk vergrendeld.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-500 ${getPhaseStyles()}`}>
      <StudentHeader session={session} participant={participant} />

      <main className="flex-1 p-4 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-4 relative">
        {participant.can_draw === 1 && (
          <button 
            onClick={() => setIsDrawingOpen(true)}
            className="absolute top-0 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-transform hover:scale-105 z-10"
            title="Teken op het bord"
          >
            <PenTool className="w-6 h-6" />
          </button>
        )}

        {isDrawingOpen && participant.can_draw === 1 && (
          <StudentDrawingPad 
            onClose={() => setIsDrawingOpen(false)}
            onSend={(dataUrl) => {
              sendSignal('DRAWING', dataUrl);
            }}
          />
        )}

        {activePrompt ? (
          <ActivePromptOverlay
            activePrompt={activePrompt}
            promptResponse={promptResponse}
            setPromptResponse={setPromptResponse}
            promptSubmitted={promptSubmitted}
            sendSignal={sendSignal}
          />
        ) : (
          <StudentSignalControls
            session={session}
            activeSignal={activeSignal}
            composingSignal={composingSignal}
            signalText={signalText}
            setComposingSignal={setComposingSignal}
            setSignalText={setSignalText}
            setActiveSignal={setActiveSignal}
            sendSignal={sendSignal}
          />
        )}
      </main>
    </div>
  );
}
