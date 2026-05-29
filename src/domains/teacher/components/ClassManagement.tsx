import React from 'react';
import { Settings, Clock, Lock, Unlock, HelpCircle } from 'lucide-react';
import { FastTooltip } from '../../../components/ui/FastTooltip';

interface ClassManagementProps {
  isLocked: boolean;
  onToggleLock: () => void;
  isHelpQuestionsEnabled: boolean;
  onToggleHelpQuestions: () => void;
  onSetTimer: (minutes: number) => void;
}

export function ClassManagement({ isLocked, onToggleLock, isHelpQuestionsEnabled, onToggleHelpQuestions, onSetTimer }: ClassManagementProps) {
  return (
    <div className="w-full flex-col space-y-1">
      {/* Quick Toggles in one row */}
      <div className="flex gap-1.5 w-full">
        <FastTooltip content="Zet de digiborden van alle leerlingen op slot. Handig als je de aandacht nodig hebt." position="top">
          <button
            onClick={onToggleLock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm border text-[10px] font-bold transition-all cursor-pointer ${
              isLocked 
                ? 'bg-rose-950/50 border-rose-900/50 text-rose-400 hover:bg-rose-900/50' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {isLocked ? 'Ontgrendel' : 'Lock klas'}
          </button>
        </FastTooltip>

        <FastTooltip content="Schakel hulpvragen in via leerling bord" position="top">
          <button
            onClick={onToggleHelpQuestions}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-sm border text-[10px] font-bold transition-all cursor-pointer ${
              isHelpQuestionsEnabled 
                ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/50' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3 h-3" />
            Hulp {isHelpQuestionsEnabled ? 'Aan' : 'Uit'}
          </button>
        </FastTooltip>
      </div>

      {/* Timer Compact Row */}
      <div className="flex items-center gap-1 w-full bg-slate-900/50 p-1 border border-slate-800/80 rounded-sm">
        <div className="px-1 text-slate-500">
          <Clock className="w-3 h-3" />
        </div>
        <div className="flex flex-1 gap-1">
          {[1, 3, 5].map((m) => (
             <button 
                key={m}
                onClick={() => onSetTimer(m)} 
                className="flex-1 py-0.5 text-[9px] font-black uppercase text-indigo-400 bg-indigo-950/30 hover:bg-indigo-950/70 border border-indigo-900/50 rounded-sm transition-colors cursor-pointer"
             >
                {m}m
             </button>
          ))}
          <button 
             onClick={() => onSetTimer(0)} 
             className="flex-1 py-0.5 text-[9px] font-black uppercase text-slate-500 bg-slate-950 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 rounded-sm transition-colors cursor-pointer"
          >
             UIT
          </button>
        </div>
      </div>
    </div>
  );
}
