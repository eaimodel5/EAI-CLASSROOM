import React from 'react';
import { Activity } from 'lucide-react';
import { ClassroomSummary } from '../../../types';

interface AiSummaryCardProps {
  activePhaseSummary: ClassroomSummary | undefined;
  generatingSummary: boolean;
  onGenerateSummary: () => void;
}

export function AiSummaryCard({ activePhaseSummary, generatingSummary, onGenerateSummary }: AiSummaryCardProps) {
  
  let suggestedActivity = null;
  let activityRationale = null;

  if (activePhaseSummary?.summary_json) {
    try {
      const parsed = JSON.parse(activePhaseSummary.summary_json);
      suggestedActivity = parsed.suggested_activity;
      activityRationale = parsed.activity_rationale;
    } catch (e) {}
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-200/40 border-2 border-indigo-100 p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/40 rounded-bl-full -mr-32 -mt-32 z-0 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4 border-b-2 border-indigo-100/50 pb-4">
        <div>
          <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-3">
            <span className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center border-2 border-indigo-200">
               <Activity className="w-6 h-6 text-indigo-600" />
            </span>
            AI-Klasduiding
          </h2>
          <p className="text-indigo-600/80 font-medium mt-2 max-w-lg">
             Krijg live inzicht in wat de klas nu nodig heeft, op basis van binnengekomen signalen.
          </p>
        </div>
        <button 
          onClick={onGenerateSummary}
          disabled={generatingSummary}
          className="text-base px-6 py-3 bg-white border-2 border-indigo-200 shadow-md text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
        >
          {generatingSummary ? 'Bezig met duiden...' : 'Duid deze fase'}
        </button>
      </div>
      
      <div className="relative z-10">
        {activePhaseSummary ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white/60 p-6 rounded-2xl border-2 border-indigo-100 shadow-sm">
              <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-4">{activePhaseSummary.headline}</h3>
              <p className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap">{activePhaseSummary.body}</p>
            </div>
            
            {suggestedActivity && (
              <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6 group hover:border-indigo-300 transition-colors shadow-xl shadow-indigo-100/50">
                <h4 className="text-xl font-black text-indigo-900 flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center border-2 border-indigo-200">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </span>
                  Voorgestelde Werkvorm: {suggestedActivity}
                </h4>
                <p className="text-base font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{activityRationale}</p>
                
                <div className="mt-6 pt-4 border-t-2 border-indigo-50 flex justify-end">
                  <button className="text-sm font-bold px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 active:translate-y-1">
                    Start {suggestedActivity}
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-indigo-500 font-black uppercase tracking-widest pt-6 border-t-2 border-indigo-100/50 flex justify-between items-center">
              <span className="bg-indigo-100 px-3 py-1 rounded-lg">Gebaseerd op {activePhaseSummary.evidence_count} signalen</span>
              <span>Update: {new Date(activePhaseSummary.generated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white/40 rounded-xl border border-dashed border-indigo-200/70 text-center animate-in fade-in">
            <Activity className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-indigo-700 font-medium">
              Nog geen AI-analyse voor deze fase. Klik op 'Duid deze fase' om signalen te clusteren en een passende werkvorm voorgesteld te krijgen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
