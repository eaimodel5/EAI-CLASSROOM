import React from 'react';
import { Sparkles } from 'lucide-react';
import { ClassroomSummary } from '../../../types';

interface AiSummaryCardProps {
  activePhaseSummary: ClassroomSummary | undefined;
  generatingSummary: boolean;
  onGenerateSummary: () => void;
}

export function AiSummaryCard({ activePhaseSummary, generatingSummary, onGenerateSummary }: AiSummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-5">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Klasduiding
        </h2>
        <button 
          onClick={onGenerateSummary}
          disabled={generatingSummary}
          className="text-sm px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          {generatingSummary ? 'Bezig...' : 'Genereer nu'}
        </button>
      </div>
      
      {activePhaseSummary ? (
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{activePhaseSummary.headline}</h3>
          <p className="text-gray-700">{activePhaseSummary.body}</p>
          <div className="text-xs text-indigo-400 font-medium mt-2">
            Gebaseerd op {activePhaseSummary.evidence_count} signalen • Laatste update: {new Date(activePhaseSummary.generated_at).toLocaleTimeString()}
          </div>
        </div>
      ) : (
        <div className="text-indigo-400/80 italic">
          Nog geen samenvatting voor deze fase. Klik op 'Genereer nu' om signalen te clusteren.
        </div>
      )}
    </div>
  );
}
