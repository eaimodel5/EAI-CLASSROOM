import React from 'react';
import { ClassroomSession, ClassroomParticipant } from '../../../types';
import { TimerDisplay } from '../../../components/shared/TimerDisplay';

interface StudentHeaderProps {
  session: ClassroomSession;
  participant: ClassroomParticipant;
}

export function StudentHeader({ session, participant }: StudentHeaderProps) {
  const getPhaseTitle = () => {
    switch (session.active_phase) {
      case 'START': return 'Start & Doel';
      case 'INSTRUCTIE': return 'Instructie';
      case 'CHECK': return 'Check van Begrip';
      case 'VERWERKEN': return 'Zelfstandig Werken';
      case 'AFSLUITING': return 'Afsluiting';
      default: return '';
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-2xl border-b border-indigo-100/50 flex flex-col sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center bg-white/50">
        <div>
          <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">{session.subject}</div>
          <div className="font-black text-slate-800 text-lg tracking-tight">{getPhaseTitle()}</div>
        </div>
        <div className="flex items-center gap-4">
          <TimerDisplay session={session} />
          <div className="w-10 h-10 bg-indigo-100/80 border border-indigo-200/60 rounded-[1rem] flex items-center justify-center text-sm font-black text-indigo-700 shadow-sm backdrop-blur-sm">
            {participant.display_name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      {session.lesson_goal && (
        <div className="px-6 py-2.5 bg-indigo-50 hover:bg-slate-100 transition-colors border-t border-indigo-100/50 select-none">
          <p className="text-xs font-bold text-indigo-600 line-clamp-2 leading-relaxed">
            <span className="opacity-70 uppercase tracking-widest text-[9px] mr-2">Lesdoel</span>
            {session.lesson_goal}
          </p>
        </div>
      )}
    </header>
  );
}
