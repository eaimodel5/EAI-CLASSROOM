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
        <h2 className="text-base font-bold opacity-70 tracking-tight text-slate-500">{session.subject} {session.grade}</h2>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-1 tracking-tight text-slate-900 drop-shadow-sm">{getPhaseTitle()}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <TimerDisplay session={session} variant="board" />
        <div className="bg-white/70 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-sm border border-white/80 text-center flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Doe mee op EAIHUB.nl</div>
          <div className="text-2xl md:text-3xl font-mono font-black tracking-widest text-indigo-600 drop-shadow-sm leading-none">{session.session_code}</div>
        </div>
      </div>
    </header>
  );
}
