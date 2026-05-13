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
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border-2 border-slate-200/60 overflow-hidden relative flex flex-col h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[4rem] -mr-32 -mt-32 z-0 mix-blend-multiply opacity-50"></div>
      
      <div className="px-8 py-6 border-b-2 border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-center relative z-10">
        <h3 className="text-2xl font-black text-slate-800">Live Signalen</h3>
        <span className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full shadow-sm border-2 border-emerald-200/50">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Feed
        </span>
      </div>
      
      <div className="p-0 flex-1 overflow-y-auto relative z-10 custom-scrollbar hide-scrollbar h-full">
        {signals.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-slate-500">Nog geen signalen ontvangen in deze les.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {signals.map(signal => {
              const student = participants.find(p => p.id === signal.participant_id);
              
              let Icon = HelpCircle;
              let colorClass = 'text-slate-500 bg-slate-100';
              let label = 'Onbekend signaal';
              
              if (signal.signal_type === 'HELP') {
                Icon = HelpCircle;
                colorClass = 'text-red-600 bg-red-100';
                label = 'Heeft hulp nodig';
              } else if (signal.signal_type === 'WORD') {
                Icon = MessageSquare;
                colorClass = 'text-blue-600 bg-blue-100';
                label = 'Vraagt om een woordverklaring';
              } else if (signal.signal_type === 'CHECK') {
                Icon = CheckCircle;
                colorClass = 'text-emerald-600 bg-emerald-100';
                label = 'Is klaar met de taak';
              } else if (signal.signal_type === 'RESPONSE') {
                Icon = MessageSquare;
                colorClass = 'text-indigo-600 bg-indigo-100';
                label = 'Heeft gereageerd op een vraag';
              } else if (signal.signal_type === 'DRAWING') {
                Icon = PenTool;
                colorClass = 'text-emerald-600 bg-emerald-100';
                label = 'Heeft een tekening verstuurd';
              }

              return (
                <li key={signal.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 break-words">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-900 truncate pr-4 text-base">{student?.display_name || 'Onbekende leerling'}</span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 shrink-0 bg-slate-100 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    {signal.text_value && (
                      <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm break-words relative">
                        {signal.signal_type === 'DRAWING' ? (
                          <div className="w-full bg-slate-50 p-2 rounded-xl border border-dashed border-slate-300">
                            <img src={signal.text_value} alt="Tekening van leerling" className="w-full h-auto rounded-lg shadow-sm bg-white" />
                            <button
                              onClick={() => onShareSignal(sharedSignalId === signal.id ? null : signal.id)}
                              className={`mt-4 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95 ${
                                sharedSignalId === signal.id
                                  ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                                  : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/50'
                              }`}
                            >
                              <MonitorPlay className="w-4 h-4" />
                              {sharedSignalId === signal.id ? 'Gedeeld op bord' : 'Deel op digibord'}
                            </button>
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-800 text-base leading-relaxed">"{signal.text_value}"</span>
                        )}
                        {signal.signal_type === 'WORD' && signal.payload_json && (
                          <div className="mt-3 pt-3 border-t border-slate-100 text-slate-600 text-sm font-medium">
                            {(() => {
                              try {
                                const payload = JSON.parse(signal.payload_json);
                                return payload.definition ? <p>{payload.definition}</p> : null;
                              } catch (e) {
                                return null;
                              }
                            })()}
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => onShareSignal(sharedSignalId === signal.id ? null : signal.id)}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 active:scale-95 ${
                                  sharedSignalId === signal.id
                                    ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                                    : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200/50'
                                }`}
                              >
                                <MonitorPlay className="w-4 h-4" />
                                {sharedSignalId === signal.id ? 'Gedeeld op bord' : 'Deel op digibord'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                      Fase: {signal.phase}
                    </div>
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
