import React from 'react';
import { ClassroomSession } from '../../../types';
import { TimerDisplay } from '../../../components/shared/TimerDisplay';

interface BoardHeaderProps {
  session: ClassroomSession;
}

export function BoardHeader({ session }: BoardHeaderProps) {
  const getPhaseTitle = () => {
    switch (session.active_phase) {
      case 'START': return 'Welkom';
      case 'INSTRUCTIE': return 'Instructie';
      case 'CHECK': return 'Check van Begrip';
      case 'VERWERKEN': return 'Zelfstandig Werken';
      case 'AFSLUITING': return 'Afsluiting';
      default: return '';
    }
  };

  return (
    <header className="p-8 flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-medium opacity-80">{session.subject} {session.grade}</h2>
        <h1 className="text-5xl font-bold mt-2 tracking-tight">{getPhaseTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <TimerDisplay session={session} variant="board" />
        <div className="bg-white/60 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-sm border border-black/5 text-center">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-60 mb-2">Doe mee via EAIHUB</div>
          <div className="text-6xl font-mono font-black tracking-widest">{session.session_code}</div>
        </div>
      </div>
    </header>
  );
}
