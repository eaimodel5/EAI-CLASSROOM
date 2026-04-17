import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { ClassroomSession, ClassroomSignal } from '../../../types';

interface BoardSharedSignalProps {
  session: ClassroomSession;
  allSignals: ClassroomSignal[];
  signals: ClassroomSignal[];
}

export function BoardSharedSignal({ session, allSignals, signals }: BoardSharedSignalProps) {
  if (!session.shared_signal_id) {
    return (
      <>
        {session.lesson_goal && (
          <div className="space-y-6 mb-12">
            <h3 className="text-2xl font-medium opacity-60 uppercase tracking-widest">Lesdoel</h3>
            <p className="text-5xl md:text-6xl font-medium leading-tight">{session.lesson_goal}</p>
          </div>
        )}
        
        {!session.lesson_goal && (
          <div className="text-4xl font-medium opacity-40 mb-12">
            Kijk naar de docent voor instructies.
          </div>
        )}

        {session.active_phase === 'CHECK' && (
          <div className="w-full max-w-3xl mt-8 grid grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {signals.filter(s => s.signal_type === 'CHECK').length}
              </div>
              <div className="text-xl font-medium opacity-70">Kunnen door</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
              <div className="text-5xl font-bold text-amber-600 mb-2">
                {signals.filter(s => s.signal_type === 'HELP').length}
              </div>
              <div className="text-xl font-medium opacity-70">Twijfelen nog</div>
            </div>
          </div>
        )}

        {session.active_phase === 'VERWERKEN' && (
          <div className="w-full max-w-3xl mt-8 grid grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {signals.filter(s => s.signal_type === 'CHECK').length}
              </div>
              <div className="text-xl font-medium opacity-70">Zijn klaar</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-black/5">
              <div className="text-5xl font-bold text-red-600 mb-2">
                {signals.filter(s => s.signal_type === 'HELP').length}
              </div>
              <div className="text-xl font-medium opacity-70">Lopen vast</div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Handling shared signal below
  const sharedSignal = allSignals.find(s => s.id === session.shared_signal_id);
  if (!sharedSignal) return null;
  
  let definition = null;
  if (sharedSignal.signal_type === 'WORD' && sharedSignal.payload_json) {
    try {
      const payload = JSON.parse(sharedSignal.payload_json);
      definition = payload.definition;
    } catch (e) {}
  }

  return (
    <div className="w-full max-w-4xl mt-12 bg-white p-12 rounded-[3rem] shadow-xl border-2 border-blue-200 animate-in zoom-in-95 duration-500 text-left relative overflow-hidden">
      <div className="absolute top-0 left-0 w-3 h-full bg-blue-500"></div>
      <div className="flex items-center gap-4 text-blue-600 mb-6">
        <MessageSquare className="w-8 h-8" />
        <span className="font-bold uppercase tracking-widest text-lg">Uitgelicht</span>
      </div>
      
      {sharedSignal.signal_type === 'DRAWING' ? (
        <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex justify-center">
          <img src={sharedSignal.text_value || ''} alt="Gedeelde tekening" className="max-w-full h-auto rounded-xl shadow-md border" />
        </div>
      ) : (
        <p className="text-4xl md:text-5xl text-gray-900 font-bold leading-relaxed mb-6">
          "{sharedSignal.text_value}"
        </p>
      )}

      {definition && (
        <div className="mt-8 pt-8 border-t-2 border-gray-100">
          <h4 className="text-xl font-bold text-blue-600 mb-4 uppercase tracking-wider">Betekenis</h4>
          <p className="text-3xl text-gray-700 leading-relaxed">
            {definition}
          </p>
        </div>
      )}
    </div>
  );
}
