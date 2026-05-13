import React from 'react';
import { Users, HelpCircle, CheckCircle } from 'lucide-react';
import { ClassroomParticipant, ClassroomSignal } from '../../../types';

interface ClassStatsProps {
  participants: ClassroomParticipant[];
  signals: ClassroomSignal[];
  activePhase: string;
}

export function ClassStats({ participants, signals, activePhase }: ClassStatsProps) {
  const helpCount = signals.filter(s => s.signal_type === 'HELP' && s.phase === activePhase).length;
  const checkCount = signals.filter(s => s.signal_type === 'CHECK' && s.phase === activePhase).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border-4 border-slate-200/60 p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 border-2 border-blue-200/50">
            <Users className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-4xl font-black tracking-tight text-slate-800">{participants.length}</div>
            <div className="text-xs font-black text-slate-500 truncate uppercase tracking-widest mt-1">Leerlingen</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border-4 border-slate-200/60 p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[4rem] -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0 border-2 border-red-200/50">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-4xl font-black tracking-tight text-slate-800">{helpCount}</div>
            <div className="text-xs font-black text-slate-500 truncate uppercase tracking-widest mt-1">Hulpvragen (Nu)</div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border-4 border-slate-200/60 p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[4rem] -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 border-2 border-emerald-200/50">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-4xl font-black tracking-tight text-slate-800">{checkCount}</div>
            <div className="text-xs font-black text-slate-500 truncate uppercase tracking-widest mt-1">Klaar (Nu)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
