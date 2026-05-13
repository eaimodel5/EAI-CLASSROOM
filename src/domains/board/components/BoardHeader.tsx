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
        <h2 className="text-2xl font-bold opacity-70 tracking-tight">{session.subject} {session.grade}</h2>
        <h1 className="text-6xl font-extrabold mt-2 tracking-tight drop-shadow-sm">{getPhaseTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <TimerDisplay session={session} variant="board" />
        <div className="bg-white/70 backdrop-blur-xl px-10 py-6 rounded-[2rem] shadow-xl border border-white/50 text-center transform rotate-2 hover:rotate-0 transition-transform duration-300">
          <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Doe mee via EAIHUB</div>
          <div className="text-6xl font-mono font-black tracking-widest text-slate-900 drop-shadow-sm">{session.session_code}</div>
        </div>
      </div>
    </header>
  );
}
