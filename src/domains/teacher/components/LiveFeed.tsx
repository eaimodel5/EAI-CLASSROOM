import React from 'react';
import { HelpCircle, MessageSquare, CheckCircle, Clock, MonitorPlay, PenTool } from 'lucide-react';
import { ClassroomSignal, ClassroomParticipant } from '../../../types';

interface LiveFeedProps {
  signals: ClassroomSignal[];
  participants: ClassroomParticipant[];
  sharedSignalId: string | null;
  onShareSignal: (signalId: string | null) => void;
}

export function LiveFeed({ signals, participants, sharedSignalId, onShareSignal }: LiveFeedProps) {
  return (
    <div className="h-full flex flex-col min-h-0 bg-slate-950 overflow-hidden relative">
      <div className="p-0 flex-1 overflow-y-auto relative z-10 custom-scrollbar hide-scrollbar h-full">
        {signals.length === 0 ? (
          <div className="p-4 text-center text-slate-600 border border-dashed border-slate-800 rounded mx-2 my-2">
            <MessageSquare className="w-5 h-5 mx-auto mb-1 opacity-50 text-slate-600" />
            <p className="font-bold text-[10px] uppercase tracking-wider text-slate-600">Nog geen signalen</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {signals.map(signal => {
              const student = participants.find(p => p.id === signal.participant_id);
              
              let Icon = HelpCircle;
              let colorClass = 'text-slate-500 bg-slate-900 border-slate-800';
              let label = 'Onbekend signaal';
              
              if (signal.signal_type === 'HELP') {
                Icon = HelpCircle;
                colorClass = 'text-rose-400 bg-rose-950/30 border-rose-900/50';
                label = 'Heeft hulp nodig';
              } else if (signal.signal_type === 'WORD') {
                Icon = MessageSquare;
                colorClass = 'text-blue-400 bg-blue-950/30 border-blue-900/50';
                label = 'Vraagt om een woordverklaring';
              } else if (signal.signal_type === 'CHECK') {
                Icon = CheckCircle;
                colorClass = 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
                label = 'Is klaar met de taak';
              } else if (signal.signal_type === 'RESPONSE') {
                Icon = MessageSquare;
                colorClass = 'text-indigo-400 bg-indigo-950/30 border-indigo-900/50';
                label = 'Heeft gereageerd op een vraag';
              } else if (signal.signal_type === 'DRAWING') {
                Icon = PenTool;
                colorClass = 'text-fuchsia-400 bg-fuchsia-950/30 border-fuchsia-900/50';
                label = 'Heeft een tekening verstuurd';
              }

              return (
                <li key={signal.id} className="p-2 transition-colors flex items-start gap-2 hover:bg-slate-900 border-b border-slate-800/40 group last:border-none">
                  <div className={`w-5 h-5 rounded-[2px] flex items-center justify-center shrink-0 border ${colorClass} mt-0.5`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0 break-words">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-300 text-[11px]">{student?.display_name || 'Onbekende leerling'}</span>
                        <span className="text-[9px] font-medium text-slate-500">{label}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 flex items-center shrink-0">
                        {new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {signal.text_value && (
                      <div className="mt-1 flex gap-2">
                        {signal.signal_type === 'DRAWING' ? (
                          <div className="w-full max-w-[200px] border-l-2 border-slate-700 pl-2 py-1">
                            <img src={signal.text_value} alt="Tekening van leerling" className="w-full h-auto rounded-[2px] bg-white opacity-90" />
                            <button
                              onClick={() => onShareSignal(sharedSignalId === signal.id ? null : signal.id)}
                              className={`mt-1.5 w-full px-2 py-0.5 text-[9px] font-bold rounded-[2px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                sharedSignalId === signal.id
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-800 text-indigo-400 hover:bg-slate-700'
                              }`}
                            >
                              <MonitorPlay className="w-2.5 h-2.5" />
                              {sharedSignalId === signal.id ? 'Gedeeld' : 'Deel'}
                            </button>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-300 text-[11px] leading-relaxed border-l-2 border-slate-700 pl-2">"{signal.text_value}"</span>
                        )}
                        {signal.signal_type === 'WORD' && signal.payload_json && (
                          <div className="text-slate-400 text-[10px] font-medium">
                            {(() => {
                              try {
                                const payload = JSON.parse(signal.payload_json);
                                return payload.definition ? (
                                  <div className="border-l-2 border-indigo-900/50 pl-2 mt-1">
                                    <p className="italic">"{payload.definition}"</p>
                                    <button
                                      onClick={() => onShareSignal(sharedSignalId === signal.id ? null : signal.id)}
                                      className={`mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded-[2px] transition-all flex items-center gap-1 cursor-pointer border ${
                                        sharedSignalId === signal.id
                                          ? 'bg-indigo-600 text-white border-indigo-500'
                                          : 'bg-slate-900 text-indigo-400 hover:bg-slate-800 border-slate-700'
                                      }`}
                                    >
                                      <MonitorPlay className="w-2.5 h-2.5" />
                                      {sharedSignalId === signal.id ? 'Gedeeld' : 'Deel'}
                                    </button>
                                  </div>
                                ) : null;
                              } catch (e) {
                                return null;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
