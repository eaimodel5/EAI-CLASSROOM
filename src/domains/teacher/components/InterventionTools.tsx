import React from 'react';
import { MessageSquare, HelpCircle, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { PromptType } from '../types';

interface InterventionToolsProps {
  activePhase: string;
  showAllTools: boolean;
  hasActivePrompt: boolean;
  hasParticipants: boolean;
  onOpenPrompt: (type: PromptType, text: string) => void;
  onPickRandomName: () => void;
}

export function InterventionTools({
  activePhase,
  showAllTools,
  hasActivePrompt,
  hasParticipants,
  onOpenPrompt,
  onPickRandomName
}: InterventionToolsProps) {
  return (
    <div className="space-y-3">
      {(showAllTools || activePhase === 'START') && (
        <button
          onClick={() => onOpenPrompt('PRIOR_KNOWLEDGE', '')}
          disabled={hasActivePrompt}
          className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <MessageSquare className="w-5 h-5" />
          Voorkennis ophalen
        </button>
      )}

      {(showAllTools || activePhase === 'INSTRUCTIE') && (
        <>
          <button
            onClick={() => onOpenPrompt('DIAGNOSTIC', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5" />
            Diagnostische Vraag
          </button>
          <button
            onClick={() => onOpenPrompt('MISCONCEPTION', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium rounded-lg border border-orange-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <HelpCircle className="w-5 h-5" />
            Misconceptie Check
          </button>
        </>
      )}

      {(showAllTools || activePhase === 'CHECK') && (
        <>
          <button
            onClick={() => onOpenPrompt('GO_NO_GO', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            Doorgaan / Niet-doorgaan Check
          </button>
          <button
            onClick={() => onOpenPrompt('CONFIDENCE', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Confidence Meter
          </button>
          <button
            onClick={onPickRandomName}
            disabled={hasActivePrompt || !hasParticipants}
            className="w-full py-3 px-4 bg-pink-50 hover:bg-pink-100 text-pink-700 font-medium rounded-lg border border-pink-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Users className="w-5 h-5" />
            Willekeurige Beurt
          </button>
        </>
      )}

      {(showAllTools || activePhase === 'VERWERKEN') && (
        <>
          <button
            onClick={() => onOpenPrompt('HINT', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg border border-amber-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Deel een Hint
          </button>
          <button
            onClick={() => onOpenPrompt('CLASS_INTERVENTION', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5" />
            Klassikale Interventie
          </button>
          <button
            onClick={() => onOpenPrompt('PEER_FEEDBACK', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium rounded-lg border border-teal-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Users className="w-5 h-5" />
            Peer Feedback
          </button>
        </>
      )}

      {(showAllTools || activePhase === 'AFSLUITING') && (
        <>
          <button
            onClick={() => onOpenPrompt('EXIT_TICKET', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-lg border border-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            Exit Ticket
          </button>
          <button
            onClick={() => onOpenPrompt('REFLECTION', '')}
            disabled={hasActivePrompt}
            className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5" />
            Reflectieprompt
          </button>
        </>
      )}
    </div>
  );
}
