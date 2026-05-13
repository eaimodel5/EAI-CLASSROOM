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
    <div className={`rounded-3xl shadow-xl border p-8 text-white relative overflow-hidden transition-all ${cardBgClass}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-full -mr-32 -mt-32 z-0 mix-blend-overlay"></div>
      
      <div className="relative z-10 flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Icon className={`w-6 h-6 ${textClass}`} />
          Actieve {activePrompt.title}
        </h2>
        <button 
          onClick={onClosePrompt}
          className={`text-sm font-bold px-4 py-2 border rounded-xl transition-all active:scale-95 shadow-sm ${btnClass}`}
        >
          Sluit {activePrompt.title}
        </button>
      </div>
      <p className="text-2xl font-bold mb-6 leading-tight max-w-2xl">{activePrompt.prompt_text}</p>
      
      <div className={`rounded-2xl p-6 ${innerBgClass} backdrop-blur-sm border border-white/10 shadow-inner relative z-10`}>
        <h3 className={`text-xs font-bold mb-4 uppercase tracking-widest ${textClass}`}>
          {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen door' : 'Antwoorden van leerlingen'}
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {responseSignals.length === 0 ? (
            <p className={`italic text-sm font-medium ${emptyTextClass}`}>
              Nog geen reacties ontvangen...
            </p>
          ) : (
            responseSignals.map(signal => {
              const student = participants.find(p => p.id === signal.participant_id);
              const isShared = sharedSignalId === signal.id;
              return (
                <div key={signal.id} className={`rounded-xl px-4 py-3 text-sm flex justify-between items-center transition-all ${isShared ? 'bg-white/30 ring-2 ring-white shadow-md' : 'bg-white/10 hover:bg-white/20'}`}>
                  <div className="flex-1 break-words min-w-0 pr-4">
                    <span className={`font-bold ${studentTextClass} block mb-1`}>{student?.display_name || 'Onbekend'}</span>
                    <span className="text-white font-medium text-base">
                      {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen ✓' : signal.text_value}
                    </span>
                  </div>
                  {activePrompt.response_mode !== 'ACKNOWLEDGE' && (
                    <button
                      onClick={() => onShareSignal(isShared ? null : signal.id)}
                      className={`ml-4 px-4 py-2 font-bold rounded-lg transition-all active:scale-95 shadow-sm whitespace-nowrap ${
                        isShared 
                          ? 'bg-white text-indigo-900 hover:bg-slate-50' 
                          : 'bg-black/20 text-white hover:bg-black/30'
                      }`}
                    >
                      {isShared ? 'Verberg op bord' : 'Deel op bord'}
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
