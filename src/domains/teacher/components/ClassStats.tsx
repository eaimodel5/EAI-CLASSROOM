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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border-2 border-slate-200/60 p-4 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-[3rem] -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 border-2 border-blue-200/50">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-black tracking-tight text-slate-800">{participants.length}</div>
            <div className="text-[10px] sm:text-xs font-black text-slate-500 truncate uppercase tracking-widest mt-1">Leerlingen</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border-2 border-slate-200/60 p-4 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[3rem] -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 shrink-0 border-2 border-red-200/50">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-black tracking-tight text-slate-800">{helpCount}</div>
            <div className="text-[10px] sm:text-xs font-black text-slate-500 truncate uppercase tracking-widest mt-1">Hulpvragen (Nu)</div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border-2 border-slate-200/60 p-4 relative overflow-hidden group hover:border-slate-300 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[3rem] -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border-2 border-emerald-200/50">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-black tracking-tight text-slate-800">{checkCount}</div>
            <div className="text-[10px] sm:text-xs font-black text-slate-500 truncate uppercase tracking-widest mt-1">Klaar (Nu)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
