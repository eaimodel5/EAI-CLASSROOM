import React from 'react';
import { Lightbulb, CheckCircle2, HelpCircle, MessageSquare } from 'lucide-react';
import { ClassroomPrompt, ClassroomSignal, ClassroomParticipant } from '../../../types';

interface ActivePromptCardProps {
  activePrompt: ClassroomPrompt;
  signals: ClassroomSignal[];
  participants: ClassroomParticipant[];
  sharedSignalId: string | null;
  onClosePrompt: () => void;
  onShareSignal: (signalId: string | null) => void;
  onUpdateParticipant?: (id: string, updates: any) => void;
}

export function ActivePromptCard({
  activePrompt,
  signals,
  participants,
  sharedSignalId,
  onClosePrompt,
  onShareSignal,
  onUpdateParticipant
}: ActivePromptCardProps) {
  const isAmber = ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type);
  const isEmerald = ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type);
  const isOrange = ['MISCONCEPTION'].includes(activePrompt.prompt_type);

  const cardBgClass = isAmber ? 'bg-amber-600 border-amber-700' :
                      isEmerald ? 'bg-emerald-600 border-emerald-700' :
                      isOrange ? 'bg-orange-600 border-orange-700' :
                      'bg-indigo-600 border-indigo-700';

  const btnClass = isAmber ? 'bg-amber-700 border-amber-500 hover:bg-amber-800' :
                   isEmerald ? 'bg-emerald-700 border-emerald-500 hover:bg-emerald-800' :
                   isOrange ? 'bg-orange-700 border-orange-500 hover:bg-orange-800' :
                   'bg-indigo-700 border-indigo-500 hover:bg-indigo-800';

  const innerBgClass = isAmber ? 'bg-amber-700/50' :
                       isEmerald ? 'bg-emerald-700/50' :
                       isOrange ? 'bg-orange-700/50' :
                       'bg-indigo-700/50';

  const textClass = isAmber ? 'text-amber-200' :
                    isEmerald ? 'text-emerald-200' :
                    isOrange ? 'text-orange-200' :
                    'text-indigo-200';

  const studentTextClass = isAmber ? 'text-amber-100' :
                           isEmerald ? 'text-emerald-100' :
                           isOrange ? 'text-orange-100' :
                           'text-indigo-100';

  const emptyTextClass = isAmber ? 'text-amber-300' :
                         isEmerald ? 'text-emerald-300' :
                         isOrange ? 'text-orange-300' :
                         'text-indigo-300';

  const Icon = isAmber ? Lightbulb :
               isEmerald ? CheckCircle2 :
               isOrange ? HelpCircle :
               MessageSquare;

  const responseSignals = signals.filter(s => s.prompt_id === activePrompt.id && s.signal_type === 'RESPONSE');

  return (
    <div className={`rounded-sm border text-white relative transition-all bg-indigo-950/20 border-indigo-900/50 p-2 overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[2rem] -mr-16 -mt-16 z-0 mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col mb-2">
        <h2 className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1.5 tracking-wider mb-1">
          <Icon className="w-3 h-3 text-indigo-400" />
          {activePrompt.title}
        </h2>
        <p className="text-[11px] font-bold text-slate-200 leading-tight break-words">{activePrompt.prompt_text}</p>
      </div>
      
      <div className={`rounded-sm p-1.5 bg-indigo-950/40 border border-indigo-900/30 relative z-10 mx-[-4px]`}>
        <h3 className={`text-[9px] font-black mb-1.5 uppercase tracking-widest text-indigo-500 pl-1`}>
          {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen door' : 'Antwoorden van leerlingen'}
        </h3>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {responseSignals.length === 0 ? (
            <p className={`italic text-[10px] font-medium text-indigo-400/50 pl-1`}>
              Nog geen reacties ontvangen...
            </p>
          ) : (
            responseSignals.map(signal => {
              const student = participants.find(p => p.id === signal.participant_id);
              const isShared = sharedSignalId === signal.id;
              return (
                <div key={signal.id} className={`rounded-[2px] px-1.5 py-1 text-[10px] flex justify-between items-center transition-all border ${isShared ? 'bg-indigo-600 border-indigo-500 shadow-sm' : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900'}`}>
                  <div className="flex-1 break-words min-w-0 pr-2">
                    <span className={`font-bold block mb-0.5 ${isShared ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {student?.display_name || 'Onbekend'}
                    </span>
                    <span className={`font-medium ${isShared ? 'text-white' : 'text-slate-200'}`}>
                      {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen ✓' : signal.text_value}
                    </span>
                  </div>
                  {activePrompt.response_mode !== 'ACKNOWLEDGE' && (
                    <button
                      onClick={() => onShareSignal(isShared ? null : signal.id)}
                      className={`ml-2 px-1.5 py-0.5 font-bold rounded-sm transition-all shadow-sm whitespace-nowrap text-[9px] cursor-pointer ${
                        isShared 
                          ? 'bg-slate-900 text-indigo-300' 
                          : 'bg-indigo-950/50 border border-indigo-900 hover:bg-indigo-900 text-indigo-400'
                      }`}
                    >
                      {isShared ? 'Verberg' : 'Deel op bord'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
