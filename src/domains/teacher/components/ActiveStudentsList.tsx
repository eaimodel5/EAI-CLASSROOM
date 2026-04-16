import React from 'react';
import { Users, XCircle } from 'lucide-react';
import { ClassroomParticipant } from '../../../types';

interface ActiveStudentsListProps {
  participants: ClassroomParticipant[];
  onRemoveParticipant: (id: string) => void;
}

export function ActiveStudentsList({ participants, onRemoveParticipant }: ActiveStudentsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-400" />
        Aanwezige Leerlingen ({participants.length})
      </h2>
      <div className="max-h-60 overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nog geen leerlingen ingelogd.</p>
        ) : (
          <ul className="space-y-2">
            {participants.map(p => (
              <li key={p.id} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg group">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    {p.display_name.charAt(0).toUpperCase()}
                  </div>
                  {p.display_name}
                </div>
                <button
                  onClick={() => onRemoveParticipant(p.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Verwijder leerling"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
