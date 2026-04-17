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
    <header className="bg-white/80 backdrop-blur-md border-b px-4 py-3 flex justify-between items-center sticky top-0 z-10">
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{session.subject}</div>
        <div className="font-bold text-gray-900">{getPhaseTitle()}</div>
      </div>
      <div className="flex items-center gap-4">
        <TimerDisplay session={session} />
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
          {participant.display_name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
