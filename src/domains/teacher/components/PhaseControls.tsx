import React from 'react';
import { Settings, CheckCircle2, Circle } from 'lucide-react';

interface PhaseControlsProps {
  activePhase: string;
  onChangePhase: (phase: string) => void;
}

export function PhaseControls({ activePhase, onChangePhase }: PhaseControlsProps) {
  const phases = [
    { id: 'START', label: 'Start & Doel', desc: 'Activeer voorkennis en doel' },
    { id: 'INSTRUCTIE', label: 'Instructie', desc: 'Nieuwe leerstof aanbieden' },
    { id: 'CHECK', label: 'Check van Begrip', desc: 'Gezamenlijke controle' },
    { id: 'VERWERKEN', label: 'Verwerking', desc: 'Zelfstandig of in groepjes' },
    { id: 'AFSLUITING', label: 'Afsluiting', desc: 'Les samenvatten en afsluiten' }
  ];

  const activeIndex = phases.findIndex(p => p.id === activePhase);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 z-0 mix-blend-multiply opacity-50"></div>
      
      <div className="relative z-10">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Lesfasering (Leerproces)
        </h2>
        
    <div className="relative border-l-4 border-slate-100 ml-4 space-y-3">
      {phases.map((phase, index) => {
        const isActive = activePhase === phase.id;
        const isPast = index < activeIndex;

        return (
          <button
            key={phase.id}
            onClick={() => onChangePhase(phase.id)}
            className={`w-full group text-left relative pl-8 flex flex-col transition-all`}
          >
            {/* Timeline Dot Indicator */}
            <span className={`absolute -left-[10px] top-2 px-1 bg-white flex items-center justify-center transition-colors ${isActive ? 'text-indigo-600' : isPast ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-400'}`}>
              {isActive ? (
                 <span className="relative flex h-4 w-4">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 ring-4 ring-indigo-100"></span>
                 </span>
              ) : isPast ? (
                 <CheckCircle2 className="w-5 h-5 bg-white" />
              ) : (
                 <Circle className="w-4 h-4 bg-white" />
              )}
            </span>
            
            {/* Content */}
            <div className={`transition-all rounded-2xl p-3 -mt-1 -ml-2 border ${isActive ? 'bg-indigo-50/80 border-indigo-200/80 shadow-sm' : 'border-transparent hover:bg-slate-50 hover:border-slate-200/40'}`}>
              <div className={`font-bold text-sm md:text-base ${isActive ? 'text-indigo-900' : isPast ? 'text-slate-700' : 'text-slate-500'}`}>
                {index + 1}. {phase.label}
              </div>
              {isActive && (
                <div className="text-sm font-bold text-indigo-600/80 mt-1 uppercase tracking-widest">
                   {phase.desc}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
      </div>
    </div>
  );
}
