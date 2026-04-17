import React from 'react';
import { LayoutGrid, Presentation } from 'lucide-react';
import { ClassroomSession } from '../../../types';
import { TimerDisplay } from '../../../../src/components/shared/TimerDisplay';

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
