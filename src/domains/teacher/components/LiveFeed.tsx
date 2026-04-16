import React from 'react';
import { HelpCircle, MessageSquare, CheckCircle, Clock, MonitorPlay } from 'lucide-react';
import { ClassroomSignal, ClassroomParticipant } from '../../../types';

interface LiveFeedProps {
  signals: ClassroomSignal[];
  participants: ClassroomParticipant[];
  sharedSignalId: string | null;
  onShareSignal: (signalId: string | null) => void;
}

export function LiveFeed({ signals, participants, sharedSignalId, onShareSignal }: LiveFeedProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-5 py-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Live Signalen</h3>
        <span className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live
        </span>
      </div>
      
      <div className="p-0 max-h-[400px] overflow-y-auto">
        {signals.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Nog geen signalen ontvangen in deze les.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {signals.map(signal => {
              const student = participants.find(p => p.id === signal.participant_id);
              
              let Icon = HelpCircle;
              let colorClass = 'text-gray-500 bg-gray-100';
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
                colorClass = 'text-green-600 bg-green-100';
                label = 'Is klaar met de taak';
              } else if (signal.signal_type === 'RESPONSE') {
                Icon = MessageSquare;
                colorClass = 'text-indigo-600 bg-indigo-100';
                label = 'Heeft gereageerd op een vraag';
              }

              return (
                <li key={signal.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 break-words">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900 truncate pr-2">{student?.display_name || 'Onbekende leerling'}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(signal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{label}</p>
                    {signal.text_value && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-800 shadow-sm break-words">
                        <span className="font-semibold">"{signal.text_value}"</span>
                        {signal.signal_type === 'WORD' && signal.payload_json && (
                          <div className="mt-2 pt-2 border-t border-gray-100 text-gray-600">
                            {(() => {
                              try {
                                const payload = JSON.parse(signal.payload_json);
                                return payload.definition ? <p>{payload.definition}</p> : null;
                              } catch (e) {
                                return null;
                              }
                            })()}
                            <button
                              onClick={() => onShareSignal(sharedSignalId === signal.id ? null : signal.id)}
                              className={`mt-3 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                                sharedSignalId === signal.id
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <MonitorPlay className="w-3 h-3" />
                              {sharedSignalId === signal.id ? 'Gedeeld op bord' : 'Deel op bord'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
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
