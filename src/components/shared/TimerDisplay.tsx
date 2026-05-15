import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { ClassroomSession } from '../../types';

interface TimerDisplayProps {
  session: ClassroomSession;
  variant?: 'default' | 'board';
}

export function TimerDisplay({ session, variant = 'default' }: TimerDisplayProps) {
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
  const isWarning = timeLeft > 0 && timeLeft <= 60000; // Last minute warning
  const isEnded = timeLeft === 0;

  const getContainerStyles = () => {
    const base = 'flex items-center font-mono font-bold';
    const state = isEnded 
      ? 'bg-red-100 text-red-700 border-red-200' 
      : isWarning 
      ? 'bg-amber-100 text-amber-700 border-amber-200 animate-pulse' 
      : 'bg-white text-gray-800 border-gray-200';
    
    const size = variant === 'board'
      ? 'gap-3 px-6 py-3 rounded-2xl text-4xl shadow-md border-2'
      : 'gap-2 px-4 py-2 rounded-full text-lg shadow-sm border';

    return `${base} ${state} ${size}`;
  };

  const getIconStyles = () => {
    const state = isEnded ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-blue-500';
    const size = variant === 'board' ? 'w-8 h-8' : 'w-5 h-5';
    return `${state} ${size}`;
  };

  return (
    <div className={getContainerStyles()}>
      <Clock className={getIconStyles()} />
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
