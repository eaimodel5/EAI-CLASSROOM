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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 overflow-hidden">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
          <div className="text-sm text-gray-500 font-medium truncate">Leerlingen</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 overflow-hidden">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold text-gray-900">{helpCount}</div>
          <div className="text-sm text-gray-500 font-medium truncate">Hulpvragen (nu)</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 overflow-hidden">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-bold text-gray-900">{checkCount}</div>
          <div className="text-sm text-gray-500 font-medium truncate">Klaar (nu)</div>
        </div>
      </div>
    </div>
  );
}
