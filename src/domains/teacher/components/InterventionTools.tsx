import React from 'react';
import { MessageSquare, HelpCircle, CheckCircle2, Lightbulb, Users } from 'lucide-react';
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
    <div className="space-y-4">
      {(showAllTools || activePhase === 'START') && (
        <button
          onClick={() => onOpenPrompt('PRIOR_KNOWLEDGE', '')}
          disabled={hasActivePrompt}
          className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-indigo-800 font-black text-base rounded-2xl border-4 border-indigo-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-indigo-200 disabled:opacity-50 hover:-translate-y-1"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
             <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>
          Voorkennis ophalen
        </button>
      )}

      {(showAllTools || activePhase === 'INSTRUCTIE') && (
        <>
          <button
            onClick={() => onOpenPrompt('DIAGNOSTIC', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-indigo-800 font-black text-base rounded-2xl border-4 border-indigo-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-indigo-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
               <MessageSquare className="w-5 h-5 text-indigo-500" />
            </div>
            Diagnostische Vraag
          </button>
          <button
            onClick={() => onOpenPrompt('MISCONCEPTION', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-orange-800 font-black text-base rounded-2xl border-4 border-orange-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-orange-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
               <HelpCircle className="w-5 h-5 text-orange-500" />
            </div>
            Misconceptie Check
          </button>
        </>
      )}

      {(showAllTools || activePhase === 'CHECK') && (
        <>
          <button
            onClick={() => onOpenPrompt('GO_NO_GO', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-indigo-800 font-black text-base rounded-2xl border-4 border-indigo-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-indigo-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
               <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            </div>
            Doorgaan / Niet-doorgaan Check
          </button>
          <button
            onClick={() => onOpenPrompt('CONFIDENCE', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-emerald-800 font-black text-base rounded-2xl border-4 border-emerald-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-emerald-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
               <Lightbulb className="w-5 h-5 text-emerald-500" />
            </div>
            Confidence Meter
          </button>
          <button
            onClick={onPickRandomName}
            disabled={hasActivePrompt || !hasParticipants}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-pink-800 font-black text-base rounded-2xl border-4 border-pink-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-pink-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
               <Users className="w-5 h-5 text-pink-500" />
            </div>
            Willekeurige Beurt
          </button>
        </>
      )}

      {(showAllTools || activePhase === 'VERWERKEN') && (
        <>
          <button
            onClick={() => onOpenPrompt('HINT', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-amber-800 font-black text-base rounded-2xl border-4 border-amber-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-amber-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
               <Lightbulb className="w-5 h-5 text-amber-500" />
            </div>
            Deel een Hint
          </button>
          <button
            onClick={() => onOpenPrompt('CLASS_INTERVENTION', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-red-800 font-black text-base rounded-2xl border-4 border-red-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-red-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
               <MessageSquare className="w-5 h-5 text-red-500" />
            </div>
            Klassikale Interventie
          </button>
          <button
            onClick={() => onOpenPrompt('PEER_FEEDBACK', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-teal-800 font-black text-base rounded-2xl border-4 border-teal-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-teal-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
               <Users className="w-5 h-5 text-teal-500" />
            </div>
            Peer Feedback
          </button>
        </>
      )}

      {(showAllTools || activePhase === 'AFSLUITING') && (
        <>
          <button
            onClick={() => onOpenPrompt('EXIT_TICKET', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-purple-800 font-black text-base rounded-2xl border-4 border-purple-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-purple-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
               <CheckCircle2 className="w-5 h-5 text-purple-500" />
            </div>
            Exit Ticket
          </button>
          <button
            onClick={() => onOpenPrompt('REFLECTION', '')}
            disabled={hasActivePrompt}
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-emerald-800 font-black text-base rounded-2xl border-4 border-emerald-50 shadow-sm transition-all flex items-center justify-start gap-4 hover:border-emerald-200 disabled:opacity-50 hover:-translate-y-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
               <MessageSquare className="w-5 h-5 text-emerald-500" />
            </div>
            Reflectieprompt
          </button>
        </>
      )}
    </div>
  );
}
