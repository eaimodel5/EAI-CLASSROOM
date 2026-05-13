import React, { useState } from 'react';
import { Users, XCircle, MoreVertical, Edit2, Clock, Trash2, PenTool, MessageSquare } from 'lucide-react';
import { ClassroomParticipant } from '../../../types';

interface ActiveStudentsListProps {
  participants: ClassroomParticipant[];
  onRemoveParticipant: (id: string) => void;
  onUpdateParticipant: (id: string, updates: { display_name?: string; timeout_until?: string | null; can_draw?: boolean; team_name?: string | null }) => void;
  onSendPrivateMessage: (id: string, message: string) => void;
}

export function ActiveStudentsList({ participants, onRemoveParticipant, onUpdateParticipant, onSendPrivateMessage }: ActiveStudentsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [messagingId, setMessagingId] = useState<string | null>(null);
  const [privateMessage, setPrivateMessage] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const handleEditClick = (p: ClassroomParticipant) => {
    setEditingId(p.id);
    setEditName(p.display_name);
    setMenuOpenId(null);
  };

  const handleMessageClick = (p: ClassroomParticipant) => {
    setMessagingId(p.id);
    setPrivateMessage('');
    setMenuOpenId(null);
  };

  const handleSaveName = (id: string) => {
    if (editName.trim()) {
      onUpdateParticipant(id, { display_name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleSendMessage = (id: string) => {
    if (privateMessage.trim()) {
      onSendPrivateMessage(id, privateMessage.trim());
    }
    setMessagingId(null);
  };

  const handleTimeout = (id: string, minutes: number) => {
    if (minutes === 0) {
      onUpdateParticipant(id, { timeout_until: null });
    } else {
      const until = new Date();
      until.setMinutes(until.getMinutes() + minutes);
      onUpdateParticipant(id, { timeout_until: until.toISOString() });
    }
    setMenuOpenId(null);
  };

  const handleToggleDraw = (id: string, canDraw: boolean) => {
    onUpdateParticipant(id, { can_draw: canDraw });
    setMenuOpenId(null);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border-2 border-slate-200/60 p-8 h-full flex flex-col">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800">
        <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border-2 border-slate-200 shrink-0">
          <Users className="w-5 h-5 text-slate-600" />
        </span>
        Aanwezige Leerlingen ({participants.length})
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar hide-scrollbar">
        {participants.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-base font-bold text-slate-500">Nog geen leerlingen ingelogd.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {participants.map(p => {
              const isTimedOut = p.timeout_until && new Date(p.timeout_until) > new Date();
              const canDraw = p.can_draw === 1;
              
              return (
              <li key={p.id} className={`flex flex-col text-sm text-gray-700 bg-white border-2 border-slate-100 px-5 py-4 rounded-2xl shadow-sm relative group hover:border-slate-300 transition-colors ${isTimedOut ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${isTimedOut ? 'bg-red-100 text-red-700 border-2 border-red-200' : 'bg-blue-100 text-blue-700 border-2 border-blue-200'}`}>
                      {p.display_name.charAt(0).toUpperCase()}
                    </div>
                    {editingId === p.id ? (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 text-sm w-full"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleSaveName(p.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName(p.id)}
                        autoFocus
                      />
                    ) : (
                      <span className="truncate flex items-center gap-2" title={p.display_name}>
                        {p.display_name} 
                        {isTimedOut && <span className="text-xs text-orange-600 font-semibold">(Timeout)</span>}
                        {canDraw && <PenTool className="w-3 h-3 text-green-600" title="Mag tekenen" />}
                      </span>
                    )}
                  </div>

                  <div className="relative ml-2">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {menuOpenId === p.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)}></div>
                        <div className="absolute right-0 top-6 w-48 bg-white border rounded-lg shadow-lg z-20 py-1">
                          <button
                            onClick={() => handleToggleDraw(p.id, !canDraw)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <PenTool className="w-4 h-4" /> {canDraw ? 'Tekenrecht intrekken' : 'Tekenrecht geven'}
                          </button>
                          <button
                            onClick={() => handleMessageClick(p)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" /> Privébericht sturen
                          </button>
                          <button
                            onClick={() => handleEditClick(p)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Naam wijzigen
                          </button>
                          {isTimedOut ? (
                            <button
                              onClick={() => handleTimeout(p.id, 0)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4" /> Hef time-out op
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTimeout(p.id, 5)}
                              className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4" /> 5 min time-out
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              onRemoveParticipant(p.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Verwijder (Kick)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {messagingId === p.id && (
                  <div className="mt-2 pt-2 border-t flex gap-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 text-sm flex-1"
                      placeholder="Typ bericht..."
                      value={privateMessage}
                      onChange={(e) => setPrivateMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(p.id)}
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSendMessage(p.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                    >Stuur</button>
                  </div>
                )}
              </li>
            )})}
          </ul>
        )}
      </div>
    </div>
  );
}
