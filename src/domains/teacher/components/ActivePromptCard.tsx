import React from 'react';
import { Sparkles, CheckCircle2, HelpCircle, MessageSquare } from 'lucide-react';
import { ClassroomPrompt, ClassroomSignal, ClassroomParticipant } from '../../../types';

interface ActivePromptCardProps {
  activePrompt: ClassroomPrompt;
  signals: ClassroomSignal[];
  participants: ClassroomParticipant[];
  sharedSignalId: string | null;
  onClosePrompt: () => void;
  onShareSignal: (signalId: string | null) => void;
}

export function ActivePromptCard({
  activePrompt,
  signals,
  participants,
  sharedSignalId,
  onClosePrompt,
  onShareSignal
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

  const Icon = isAmber ? Sparkles :
               isEmerald ? CheckCircle2 :
               isOrange ? HelpCircle :
               MessageSquare;

  const responseSignals = signals.filter(s => s.prompt_id === activePrompt.id && s.signal_type === 'RESPONSE');

  return (
    <div className={`rounded-xl shadow-sm border p-5 text-white ${cardBgClass}`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icon className={`w-5 h-5 ${textClass}`} />
          Actieve {activePrompt.title}
        </h2>
        <button 
          onClick={onClosePrompt}
          className={`text-sm px-3 py-1.5 border rounded-lg transition-colors ${btnClass}`}
        >
          Sluit {activePrompt.title}
        </button>
      </div>
      <p className="text-xl font-medium mb-4">{activePrompt.prompt_text}</p>
      
      <div className={`rounded-lg p-4 ${innerBgClass}`}>
        <h3 className={`text-sm font-semibold mb-3 uppercase tracking-wider ${textClass}`}>
          {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen door' : 'Antwoorden van leerlingen'}
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {responseSignals.length === 0 ? (
            <p className={`italic text-sm ${emptyTextClass}`}>
              Nog geen reacties ontvangen...
            </p>
          ) : (
            responseSignals.map(signal => {
              const student = participants.find(p => p.id === signal.participant_id);
              const isShared = sharedSignalId === signal.id;
              return (
                <div key={signal.id} className={`rounded px-3 py-2 text-sm flex justify-between items-center transition-colors ${isShared ? 'bg-white/30 ring-2 ring-white' : 'bg-white/10 hover:bg-white/20'}`}>
                  <div className="flex-1 break-words min-w-0">
                    <span className={`font-medium ${studentTextClass}`}>{student?.display_name || 'Onbekend'}</span>
                    <span className="text-white ml-2 block sm:inline">
                      {activePrompt.response_mode === 'ACKNOWLEDGE' ? 'Gelezen ✓' : signal.text_value}
                    </span>
                  </div>
                  {activePrompt.response_mode !== 'ACKNOWLEDGE' && (
                    <button
                      onClick={() => onShareSignal(isShared ? null : signal.id)}
                      className={`ml-4 px-2 py-1 text-xs font-medium rounded transition-colors ${
                        isShared 
                          ? 'bg-white text-indigo-900 hover:bg-gray-100' 
                          : 'bg-black/20 text-white hover:bg-black/40'
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
