import React from 'react';
import { Play } from 'lucide-react';
import { LessonPreparation } from '../../../types';
import { PromptType } from '../types';

interface QuickActionsProps {
  parsedPrep: LessonPreparation | null;
  activePhase: string;
  showAllTools: boolean;
  hasActivePrompt: boolean;
  onOpenPrompt: (type: PromptType, text: string) => void;
}

export function QuickActions({
  parsedPrep,
  activePhase,
  showAllTools,
  hasActivePrompt,
  onOpenPrompt
}: QuickActionsProps) {
  if (!parsedPrep) return null;

  const hasPrior = parsedPrep.priorKnowledgeQuestions?.some((q: string) => q) && (showAllTools || activePhase === 'START');
  const hasCheck = parsedPrep.checkQuestions?.some((q: string) => q) && (showAllTools || activePhase === 'CHECK');
  const hasExit = parsedPrep.exitTicketQuestions?.some((q: string) => q) && (showAllTools || activePhase === 'AFSLUITING');
  
  if (!hasPrior && !hasCheck && !hasExit) return null;

  return (
    <div className="mb-6 space-y-3 border-b-2 border-slate-100 pb-8">
      {parsedPrep.priorKnowledgeQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'START') && q && (
          <button
            key={`prior-${idx}`}
            onClick={() => onOpenPrompt('PRIOR_KNOWLEDGE', q)}
            disabled={hasActivePrompt}
            className="w-full p-4 bg-white hover:bg-slate-50 text-indigo-800 text-base font-bold rounded-2xl border-4 border-indigo-50 shadow-sm transition-all flex items-center justify-between disabled:opacity-50 text-left hover:-translate-y-1 hover:border-indigo-200 group"
          >
            <span className="flex-1 whitespace-pre-wrap leading-relaxed">{q}</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 ml-4 group-hover:bg-indigo-100 transition-colors">
               <Play className="w-5 h-5 text-indigo-500 ml-1" />
            </div>
          </button>
        )
      ))}

      {parsedPrep.checkQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'CHECK') && q && (
          <button
            key={`check-${idx}`}
            onClick={() => onOpenPrompt('CHECK_QUESTION', q)}
            disabled={hasActivePrompt}
            className="w-full p-4 bg-white hover:bg-slate-50 text-indigo-800 text-base font-bold rounded-2xl border-4 border-indigo-50 shadow-sm transition-all flex items-center justify-between disabled:opacity-50 text-left hover:-translate-y-1 hover:border-indigo-200 group"
          >
            <span className="flex-1 whitespace-pre-wrap leading-relaxed">{q}</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 ml-4 group-hover:bg-indigo-100 transition-colors">
               <Play className="w-5 h-5 text-indigo-500 ml-1" />
            </div>
          </button>
        )
      ))}

      {parsedPrep.exitTicketQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'AFSLUITING') && q && (
          <button
            key={`exit-${idx}`}
            onClick={() => onOpenPrompt('EXIT_TICKET', q)}
            disabled={hasActivePrompt}
            className="w-full p-4 bg-white hover:bg-slate-50 text-indigo-800 text-base font-bold rounded-2xl border-4 border-indigo-50 shadow-sm transition-all flex items-center justify-between disabled:opacity-50 text-left hover:-translate-y-1 hover:border-indigo-200 group"
          >
            <span className="flex-1 whitespace-pre-wrap leading-relaxed">{q}</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 ml-4 group-hover:bg-indigo-100 transition-colors">
               <Play className="w-5 h-5 text-indigo-500 ml-1" />
            </div>
          </button>
        )
      ))}
    </div>
  );
}
