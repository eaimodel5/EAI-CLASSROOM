import React, { useState } from 'react';
import { useStudentSession } from '../hooks/useStudentSession';
import { JoinSessionForm } from '../components/JoinSessionForm';
import { StudentHeader } from '../components/StudentHeader';
import { StudentSignalControls } from '../components/StudentSignalControls';
import { ActivePromptOverlay } from '../components/ActivePromptOverlay';
import { StudentDrawingPad } from '../components/StudentDrawingPad';
import { CheckCircle, PenTool } from 'lucide-react';
import GridBackground from '../../../components/GridBackground';

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
      <div className="min-h-[100dvh] bg-slate-50/50 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 p-10 max-w-sm w-full text-center relative z-10 animate-in zoom-in-95 duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-300"></div>
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 tracking-tight">Les is afgelopen</h1>
          <p className="text-slate-600 font-medium leading-relaxed mb-8">De docent heeft deze sessie beëindigd. Bedankt voor het meedoen!</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98]"
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
      <div className="min-h-[100dvh] bg-orange-50/50 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-200/60 p-10 max-w-sm w-full text-center relative z-10 animate-in zoom-in-95 duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-400"></div>
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-4xl animate-bounce">⏳</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 tracking-tight">Kijk naar de docent</h1>
          <p className="text-slate-600 font-medium leading-relaxed">Je hebt een time-out gekregen van de docent. Je kunt even niet actief deelnemen.</p>
        </div>
      </div>
    );
  }

  if (session.is_locked === 1) {
    return (
      <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-slate-900 pointer-events-none"></div>
        <div className="text-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-widest uppercase opacity-90 drop-shadow-sm">Kijk naar de docent</h1>
          <p className="text-slate-400 text-xl font-medium">Je scherm is tijdelijk vergrendeld.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-500 bg-transparent relative`}>
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <GridBackground />
        <div className={`absolute inset-0 transition-colors duration-500 ${getPhaseStyles()} opacity-90 backdrop-blur-[2px]`}></div>
      </div>

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
