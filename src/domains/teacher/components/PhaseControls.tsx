import React from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';

interface PhaseControlsProps {
  activePhase: string;
  onChangePhase: (phase: string) => void;
}

export function PhaseControls({ activePhase, onChangePhase }: PhaseControlsProps) {
  const phases = [
    { id: 'START', label: '1. Start & Doel' },
    { id: 'INSTRUCTIE', label: '2. Instructie' },
    { id: 'CHECK', label: '3. Check van Begrip' },
    { id: 'VERWERKEN', label: '4. Verwerking' },
    { id: 'AFSLUITING', label: '5. Afsluiting' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-400" />
        Lesfase
      </h2>
      <div className="space-y-2">
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onChangePhase(phase.id)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
              activePhase === phase.id 
                ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="font-medium">{phase.label}</span>
            {activePhase === phase.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>
        ))}
      </div>
    </div>
  );
}
