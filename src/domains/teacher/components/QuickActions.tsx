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
    <div className="mb-6 space-y-2 border-b pb-4">
      <h3 className="text-sm font-semibold text-indigo-900 mb-3">Snelle Acties (Voorbereiding)</h3>
      
      {parsedPrep.priorKnowledgeQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'START') && q && (
          <button
            key={`prior-${idx}`}
            onClick={() => onOpenPrompt('PRIOR_KNOWLEDGE', q)}
            disabled={hasActivePrompt}
            className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-between disabled:opacity-50 text-left"
          >
            <span className="truncate pr-2">{q}</span>
            <Play className="w-4 h-4 shrink-0" />
          </button>
        )
      ))}

      {parsedPrep.checkQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'CHECK') && q && (
          <button
            key={`check-${idx}`}
            onClick={() => onOpenPrompt('CHECK_QUESTION', q)}
            disabled={hasActivePrompt}
            className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-between disabled:opacity-50 text-left"
          >
            <span className="truncate pr-2">{q}</span>
            <Play className="w-4 h-4 shrink-0" />
          </button>
        )
      ))}

      {parsedPrep.exitTicketQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'AFSLUITING') && q && (
          <button
            key={`exit-${idx}`}
            onClick={() => onOpenPrompt('EXIT_TICKET', q)}
            disabled={hasActivePrompt}
            className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-between disabled:opacity-50 text-left"
          >
            <span className="truncate pr-2">{q}</span>
            <Play className="w-4 h-4 shrink-0" />
          </button>
        )
      ))}
    </div>
  );
}
