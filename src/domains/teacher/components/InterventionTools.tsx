import React from 'react';
import { MessageSquare, HelpCircle, CheckCircle2, Lightbulb, Users } from 'lucide-react';
import { PromptType } from '../types';
import { FastTooltip } from '../../../components/ui/FastTooltip';

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
  const getButtonStyles = () => "w-full p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-medium rounded-sm border border-slate-800 transition-all flex items-center justify-start gap-2 disabled:opacity-50 text-left group cursor-pointer mb-1";
  const getIconContainerStyles = (color: string) => `w-4 h-4 rounded-[2px] flex items-center justify-center shrink-0 border transition-colors ${color}`;

  return (
    <div className="space-y-0.5">
      {(showAllTools || activePhase === 'START') && (
        <FastTooltip content="Stel een vraag om te testen wat de klas al weet over dit onderwerp (voorkennis).">
          <button
            onClick={() => onOpenPrompt('PRIOR_KNOWLEDGE', '')}
            disabled={hasActivePrompt}
            className={getButtonStyles()}
          >
            <div className={getIconContainerStyles('bg-indigo-950/50 border-indigo-500/30 group-hover:bg-indigo-600')}>
               <MessageSquare className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white" />
            </div>
            Voorkennis ophalen
          </button>
        </FastTooltip>
      )}

      {(showAllTools || activePhase === 'INSTRUCTIE') && (
        <>
          <FastTooltip content="Snel een testvraag stellen om te kijken of de instructie is begrepen.">
            <button
              onClick={() => onOpenPrompt('DIAGNOSTIC', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-indigo-950/50 border-indigo-500/30 group-hover:bg-indigo-600')}>
                 <MessageSquare className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white" />
              </div>
              Diagnostische Vraag
            </button>
          </FastTooltip>
          <FastTooltip content="Vraag specifiek gericht op een bekende valkuil of denkfout.">
            <button
              onClick={() => onOpenPrompt('MISCONCEPTION', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-orange-950/50 border-orange-500/30 group-hover:bg-orange-600')}>
                 <HelpCircle className="w-2.5 h-2.5 text-orange-400 group-hover:text-white" />
              </div>
              Misconceptie Check
            </button>
          </FastTooltip>
        </>
      )}

      {(showAllTools || activePhase === 'CHECK') && (
        <>
          <FastTooltip content="Controleer of je door kan naar het volgende onderwerp (bijv. duimpjes peiling).">
            <button
              onClick={() => onOpenPrompt('GO_NO_GO', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-indigo-950/50 border-indigo-500/30 group-hover:bg-indigo-600')}>
                 <CheckCircle2 className="w-2.5 h-2.5 text-indigo-400 group-hover:text-white" />
              </div>
              Doorgaan / Niet-doorgaan Check
            </button>
          </FastTooltip>
          <FastTooltip content="Laat leerlingen aangeven hoe zeker ze zich voelen over de stof (schaal 1-10 of stoplicht).">
            <button
              onClick={() => onOpenPrompt('CONFIDENCE', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-emerald-950/30 border-emerald-500/30 group-hover:bg-emerald-600')}>
                 <Lightbulb className="w-2.5 h-2.5 text-emerald-400 group-hover:text-white" />
              </div>
              Confidence Meter
            </button>
          </FastTooltip>
          <FastTooltip content="Draai aan het rad om willekeurig een leerling de beurt te geven (geen active prompt, trekt alleen de aandacht).">
            <button
              onClick={onPickRandomName}
              disabled={hasActivePrompt || !hasParticipants}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-pink-950/50 border-pink-500/30 group-hover:bg-pink-600')}>
                 <Users className="w-2.5 h-2.5 text-pink-400 group-hover:text-white" />
              </div>
              Willekeurige Beurt
            </button>
          </FastTooltip>
        </>
      )}

      {(showAllTools || activePhase === 'VERWERKEN') && (
        <>
          <FastTooltip content="Stuur een gerichte tip naar alle leerlingen als ze vastlopen tijdens een verwerkingsopdracht.">
            <button
              onClick={() => onOpenPrompt('HINT', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-amber-950/50 border-amber-500/30 group-hover:bg-amber-600')}>
                 <Lightbulb className="w-2.5 h-2.5 text-amber-400 group-hover:text-white" />
              </div>
              Deel een Hint
            </button>
          </FastTooltip>
          <FastTooltip content="Zet de hele klas tijdelijk on-hold om collectief een fout te bespreken.">
            <button
              onClick={() => onOpenPrompt('CLASS_INTERVENTION', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-red-950/50 border-red-500/30 group-hover:bg-red-600')}>
                 <MessageSquare className="w-2.5 h-2.5 text-red-400 group-hover:text-white" />
              </div>
              Klassikale Interventie
            </button>
          </FastTooltip>
          <FastTooltip content="Vraag de leerlingen om feedback of beoordeling op andermans werk, of activeer samenwerking.">
            <button
              onClick={() => onOpenPrompt('PEER_FEEDBACK', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-teal-950/50 border-teal-500/30 group-hover:bg-teal-600')}>
                 <Users className="w-2.5 h-2.5 text-teal-400 group-hover:text-white" />
              </div>
              Peer Feedback
            </button>
          </FastTooltip>
        </>
      )}

      {(showAllTools || activePhase === 'AFSLUITING') && (
        <>
          <FastTooltip content="Stel één finale afsluitende vraag (exit ticket) om te controleren of het lesdoel is behaald.">
            <button
              onClick={() => onOpenPrompt('EXIT_TICKET', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-purple-950/50 border-purple-500/30 group-hover:bg-purple-600')}>
                 <CheckCircle2 className="w-2.5 h-2.5 text-purple-400 group-hover:text-white" />
              </div>
              Exit Ticket
            </button>
          </FastTooltip>
          <FastTooltip content="Vraag leerlingen om te reflecteren op hun eigen leerproces of inzet vandaag.">
            <button
              onClick={() => onOpenPrompt('REFLECTION', '')}
              disabled={hasActivePrompt}
              className={getButtonStyles()}
            >
              <div className={getIconContainerStyles('bg-emerald-950/30 border-emerald-500/30 group-hover:bg-emerald-600')}>
                 <MessageSquare className="w-2.5 h-2.5 text-emerald-400 group-hover:text-white" />
              </div>
              Reflectieprompt
            </button>
          </FastTooltip>
        </>
      )}
    </div>
  );
}
