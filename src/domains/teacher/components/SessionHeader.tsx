import React, { useState, useEffect } from 'react';
import { Clock, LayoutGrid, Presentation } from 'lucide-react';
import { ClassroomSession } from '../../../types';

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
  const isWarning = timeLeft > 0 && timeLeft <= 60000;
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

interface SessionHeaderProps {
  session: ClassroomSession;
  onOpenWidgets: () => void;
}

export function SessionHeader({ session, onOpenWidgets }: SessionHeaderProps) {
  return (
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
          onClick={onOpenWidgets}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
          Widgets
        </button>
        <button 
          onClick={() => window.open(`/board/${session.session_code}`, '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          <Presentation className="w-4 h-4" />
          Open Board
        </button>
      </div>
    </header>
  );
}
