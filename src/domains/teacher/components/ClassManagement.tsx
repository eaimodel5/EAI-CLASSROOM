import React from 'react';
import { Settings, Clock } from 'lucide-react';

interface ClassManagementProps {
  isLocked: boolean;
  onToggleLock: () => void;
  onSetTimer: (minutes: number) => void;
}

export function ClassManagement({ isLocked, onToggleLock, onSetTimer }: ClassManagementProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-400" />
        Klassenmanagement
      </h2>
      <div className="space-y-4">
        {/* Lock Session */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <h3 className="font-medium text-sm text-gray-900">Sessie Vergrendelen</h3>
            <p className="text-xs text-gray-500">Voorkom dat nieuwe leerlingen deelnemen</p>
          </div>
          <button
            onClick={onToggleLock}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isLocked ? 'bg-red-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isLocked ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Timer */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-medium text-sm text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Timer Instellen
          </h3>
          <div className="flex gap-2">
            <button onClick={() => onSetTimer(1)} className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">1 min</button>
            <button onClick={() => onSetTimer(3)} className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">3 min</button>
            <button onClick={() => onSetTimer(5)} className="flex-1 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">5 min</button>
            <button onClick={() => onSetTimer(0)} className="flex-1 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors">Stop</button>
          </div>
        </div>
      </div>
    </div>
  );
}
