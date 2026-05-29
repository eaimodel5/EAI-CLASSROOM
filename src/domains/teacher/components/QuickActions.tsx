import React from 'react';
import { Play } from 'lucide-react';
import { LessonPreparation } from '../../../types';
import { PromptType } from '../types';
import { FastTooltip } from '../../../components/ui/FastTooltip';

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
  const hasInstructie = parsedPrep.instructionActivities?.some((q: string) => q) && (showAllTools || activePhase === 'INSTRUCTIE');
  const hasCheck = parsedPrep.checkQuestions?.some((q: string) => q) && (showAllTools || activePhase === 'CHECK');
  const hasVerwerken = parsedPrep.processingActivities?.some((q: string) => q) && (showAllTools || activePhase === 'VERWERKEN');
  const hasExit = parsedPrep.exitTicketQuestions?.some((q: string) => q) && (showAllTools || activePhase === 'AFSLUITING');
  
  if (!hasPrior && !hasInstructie && !hasCheck && !hasVerwerken && !hasExit) return null;

  const getButtonStyles = () => "w-full p-1.5 bg-slate-900 hover:bg-indigo-950/40 text-slate-300 text-[10px] font-medium rounded-sm border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between disabled:opacity-50 text-left group cursor-pointer leading-tight mb-1";
  const getIconStyles = () => "w-4 h-4 rounded-[2px] bg-indigo-950/50 flex items-center justify-center shrink-0 ml-2 group-hover:bg-indigo-600 transition-colors border border-indigo-500/30";

  return (
    <div className="space-y-1">
      {parsedPrep.priorKnowledgeQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'START') && q && (
          <FastTooltip key={`prior-${idx}`} content={q}>
            <button
              onClick={() => onOpenPrompt('PRIOR_KNOWLEDGE', q)}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <span className="flex-1 whitespace-pre-wrap line-clamp-2">{q}</span>
              <div className={getIconStyles()}>
                 <Play className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white ml-0.5" />
              </div>
            </button>
          </FastTooltip>
        )
      ))}

      {parsedPrep.instructionActivities?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'INSTRUCTIE') && q && (
          <FastTooltip key={`instructie-${idx}`} content={q}>
            <button
              onClick={() => onOpenPrompt('DIAGNOSTIC', q)}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <span className="flex-1 whitespace-pre-wrap line-clamp-2">{q}</span>
              <div className={getIconStyles()}>
                 <Play className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white ml-0.5" />
              </div>
            </button>
          </FastTooltip>
        )
      ))}

      {parsedPrep.checkQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'CHECK') && q && (
          <FastTooltip key={`check-${idx}`} content={q}>
            <button
              onClick={() => onOpenPrompt('CHECK_QUESTION', q)}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <span className="flex-1 whitespace-pre-wrap line-clamp-2">{q}</span>
              <div className={getIconStyles()}>
                 <Play className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white ml-0.5" />
              </div>
            </button>
          </FastTooltip>
        )
      ))}

      {parsedPrep.processingActivities?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'VERWERKEN') && q && (
          <FastTooltip key={`verwerken-${idx}`} content={q}>
            <button
              onClick={() => onOpenPrompt('CHECK_QUESTION', q)}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <span className="flex-1 whitespace-pre-wrap line-clamp-2">{q}</span>
              <div className={getIconStyles()}>
                 <Play className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white ml-0.5" />
              </div>
            </button>
          </FastTooltip>
        )
      ))}

      {parsedPrep.exitTicketQuestions?.map((q: string, idx: number) => (
        (showAllTools || activePhase === 'AFSLUITING') && q && (
          <FastTooltip key={`exit-${idx}`} content={q}>
            <button
              onClick={() => onOpenPrompt('EXIT_TICKET', q)}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <span className="flex-1 whitespace-pre-wrap line-clamp-2">{q}</span>
              <div className={getIconStyles()}>
                 <Play className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white ml-0.5" />
              </div>
            </button>
          </FastTooltip>
        )
      ))}
    </div>
  );
}
