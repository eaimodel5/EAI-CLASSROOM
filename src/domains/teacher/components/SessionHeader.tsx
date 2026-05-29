import React from 'react';
import { LayoutGrid, Presentation, Edit2 } from 'lucide-react';
import { ClassroomSession } from '../../../types';
import { TimerDisplay } from '../../../../src/components/shared/TimerDisplay';

interface SessionHeaderProps {
  session: ClassroomSession;
  onOpenWidgets: () => void;
  onEditPrep?: () => void;
}

export function SessionHeader({ session, onOpenWidgets, onEditPrep }: SessionHeaderProps) {
  return (
    <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
      
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-slate-200 truncate max-w-[150px]">{session.subject}</span>
        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-sm">K:{session.grade}</span>
        {onEditPrep && (
          <button onClick={onEditPrep} className="p-1 text-slate-500 hover:text-indigo-400 transition-colors" title="Les aanpassen">
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
      
      <div className="hidden md:flex items-center gap-2">
        <div className="text-xs font-black uppercase text-slate-600 tracking-wider">Doel:</div>
        <div className="text-xs font-medium text-slate-400 truncate max-w-[250px]" title={session.lesson_goal}>
          {session.lesson_goal || 'Geen doel ingesteld'}
        </div>
      </div>

      <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

      <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
        <span className="text-xs text-slate-500 uppercase font-bold">Code:</span>
        <span className="font-mono text-sm font-bold text-indigo-400">{session.session_code}</span>
      </div>

      <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <TimerDisplay session={session} compact />
        
        <button 
          onClick={onOpenWidgets}
          title="Open mini-apps op het centrale lesbord (digibord)"
          className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded font-bold text-xs transition-all border border-indigo-500/30 cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden md:inline">Tools</span>
        </button>
        
        <button 
          onClick={() => window.open(`/board/${session.session_code}`, '_blank')}
          title="Open student digibord"
          className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs transition-all border border-slate-700 cursor-pointer"
        >
          <Presentation className="w-4 h-4" />
          <span className="hidden md:inline">Bord</span>
        </button>
      </div>

    </div>
  );
}

