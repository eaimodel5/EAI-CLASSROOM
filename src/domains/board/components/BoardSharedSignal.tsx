import React from 'react';
import { Lightbulb, MessageSquare } from 'lucide-react';
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
          <div className="space-y-4 mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
            <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block shadow-sm border border-slate-200/50">Het Lesdoel van Vandaag</h3>
            <p className="text-2xl md:text-4xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{session.lesson_goal}</p>
          </div>
        )}
        
        {!session.lesson_goal && (
          <div className="text-2xl md:text-3xl font-bold text-slate-800/40 mb-12 animate-pulse">
            Kijk naar de docent voor instructies.
          </div>
        )}

        {session.active_phase === 'CHECK' && (
          <div className="w-full max-w-3xl mt-8 grid grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-500/10 text-center transform hover:scale-105 transition-transform">
              <div className="text-7xl font-black text-emerald-500 mb-4 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'CHECK').length}
              </div>
              <div className="text-xl font-bold uppercase tracking-widest text-emerald-800/70">Kunnen door</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-amber-100 shadow-xl shadow-amber-500/10 text-center transform hover:scale-105 transition-transform">
              <div className="text-7xl font-black text-amber-500 mb-4 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'HELP').length}
              </div>
              <div className="text-xl font-bold uppercase tracking-widest text-amber-800/70">Twijfelen nog</div>
            </div>
          </div>
        )}

        {session.active_phase === 'VERWERKEN' && (
          <div className="w-full max-w-3xl mt-8 grid grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-500/10 text-center transform hover:scale-105 transition-transform">
              <div className="text-7xl font-black text-emerald-500 mb-4 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'CHECK').length}
              </div>
              <div className="text-xl font-bold uppercase tracking-widest text-emerald-800/70">Zijn klaar</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-500/10 text-center transform hover:scale-105 transition-transform">
              <div className="text-7xl font-black text-red-500 mb-4 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'HELP').length}
              </div>
              <div className="text-xl font-bold uppercase tracking-widest text-red-800/70">Lopen vast</div>
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
    <div className="w-full max-w-5xl mt-12 bg-white/90 backdrop-blur-xl p-16 rounded-[4rem] shadow-2xl border border-indigo-100 animate-in zoom-in-95 duration-500 text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-bl-full -mr-32 -mt-32 z-0 mix-blend-multiply opacity-50"></div>
      <div className="absolute top-0 left-0 w-4 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
      
      <div className="relative z-10 flex items-center gap-4 text-indigo-600 mb-8">
        <Lightbulb className="w-10 h-10" />
        <span className="font-bold uppercase tracking-widest text-xl">Uitgelicht op het bord</span>
      </div>
      
      {sharedSignal.signal_type === 'DRAWING' ? (
        <div className="relative z-10 w-full bg-slate-50/50 backdrop-blur-sm border-4 border-dashed border-slate-200/60 rounded-[3rem] p-8 flex justify-center">
          <img src={sharedSignal.text_value || ''} alt="Gedeelde tekening" className="max-w-full h-auto rounded-3xl shadow-xl border border-white" />
        </div>
      ) : (
        <p className="relative z-10 text-3xl md:text-5xl text-slate-800 font-bold leading-relaxed mb-8 italic drop-shadow-sm">
          "{sharedSignal.text_value}"
        </p>
      )}

      {definition && (
        <div className="relative z-10 mt-8 pt-8 border-t border-slate-200/50">
          <h4 className="text-sm font-bold text-indigo-500 mb-2 uppercase tracking-widest">Betekenis</h4>
          <p className="text-2xl text-slate-700 leading-relaxed font-medium">
            {definition}
          </p>
        </div>
      )}
    </div>
  );
}
