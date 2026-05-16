import React from 'react';
import { Settings, Clock } from 'lucide-react';

interface ClassManagementProps {
  isLocked: boolean;
  onToggleLock: () => void;
  onSetTimer: (minutes: number) => void;
}

export function ClassManagement({ isLocked, onToggleLock, onSetTimer }: ClassManagementProps) {
  return (
    <div className="w-full h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-slate-700/50 rounded-bl-full -mr-24 -mt-24 z-0 transition-transform duration-700 group-hover:scale-110"></div>
      
      <div className="relative z-10">
        <h2 className="text-lg font-black text-white mb-4 flex items-center gap-3">
          <Settings className="w-6 h-6 text-indigo-400" />
          Beheer
        </h2>
        <div className="space-y-4">
          {/* Lock Session */}
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border-2 border-slate-600/50 shadow-inner">
            <div>
              <h3 className="font-extrabold text-base text-white">Schermen op Zwart</h3>
              <p className="text-sm font-bold text-slate-400 mt-1">Blokkeer alle borden</p>
            </div>
            <button
              onClick={onToggleLock}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isLocked ? 'bg-red-500' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${isLocked ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Timer */}
          <div className="p-4 bg-slate-700/50 rounded-xl border-2 border-slate-600/50 shadow-inner">
            <h3 className="font-extrabold text-base text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Sessie Timer
            </h3>
            <div className="flex gap-3">
              <button onClick={() => onSetTimer(1)} className="flex-1 py-3 text-sm font-black uppercase tracking-wider bg-slate-600 text-slate-200 border-2 border-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95">1m</button>
              <button onClick={() => onSetTimer(3)} className="flex-1 py-3 text-sm font-black uppercase tracking-wider bg-slate-600 text-slate-200 border-2 border-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95">3m</button>
              <button onClick={() => onSetTimer(5)} className="flex-1 py-3 text-sm font-black uppercase tracking-wider bg-slate-600 text-slate-200 border-2 border-slate-500 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95">5m</button>
              <button onClick={() => onSetTimer(0)} className="flex-1 py-3 text-sm font-black uppercase tracking-wider bg-red-500/20 text-red-400 border-2 border-red-500/50 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95">Uit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
