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
    <header className="bg-white/95 backdrop-blur-2xl border-b-2 border-slate-200/80 sticky top-0 z-50 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-center">
        <div className="text-center md:text-left w-full md:w-auto">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 flex flex-col md:flex-row items-center gap-2 md:gap-0">{session.subject} <span className="font-bold text-slate-500 md:ml-3 bg-slate-100 px-3 py-1 rounded-lg text-sm">Klas {session.grade}</span></h1>
            {onEditPrep && (
              <button onClick={onEditPrep} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-2" title="Les aanpassen">
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-2">Doel: {session.lesson_goal || 'Geen doel ingesteld'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 w-full md:w-auto">
          <TimerDisplay session={session} />
          
          <div className="text-center px-4 md:px-8 border-l-2 md:border-l-4 border-slate-100 flex-1 md:flex-none">
            <div className="text-[10px] md:text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Bord Code</div>
            <div className="text-lg md:text-xl font-mono font-bold text-indigo-600 tracking-widest bg-indigo-50/50 px-3 md:px-4 py-1 rounded-xl border-2 border-indigo-100/50">{session.session_code}</div>
          </div>
          
          <div className="flex items-center justify-center gap-2 md:gap-4 pl-0 md:pl-4 border-l-0 md:border-l-4 border-slate-100 w-full md:w-auto mt-2 md:mt-0">
            <button 
              onClick={onOpenWidgets}
              title="Open mini-apps op het centrale lesbord (digibord)"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-2xl font-black text-sm md:text-base transition-all border-2 border-indigo-200 shadow-sm active:scale-95 group"
            >
              <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              Bord Tools
            </button>
            <button 
              onClick={() => window.open(`/board/${session.session_code}`, '_blank')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-sm md:text-base transition-all border-2 border-slate-200 shadow-sm active:scale-95"
            >
              <Presentation className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
              Open Board
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
