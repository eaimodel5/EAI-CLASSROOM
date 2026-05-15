import React from 'react';
import { HelpCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { ClassroomSession } from '../../../types';

interface StudentSignalControlsProps {
  session: ClassroomSession;
  activeSignal: string | null;
  composingSignal: 'HELP' | 'WORD' | 'CHECK' | null;
  signalText: string;
  setComposingSignal: (val: 'HELP' | 'WORD' | 'CHECK' | null) => void;
  setSignalText: (val: string) => void;
  setActiveSignal: (val: string | null) => void;
  sendSignal: (type: 'HELP' | 'WORD' | 'CHECK' | 'EXIT' | 'RESPONSE', text?: string) => void;
}

export function StudentSignalControls({
  session,
  activeSignal,
  composingSignal,
  signalText,
  setComposingSignal,
  setSignalText,
  setActiveSignal,
  sendSignal
}: StudentSignalControlsProps) {

  if (composingSignal) {
    return (
      <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/60 w-full animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-bl-full -mr-24 -mt-24 z-0 mix-blend-multiply opacity-50"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-tight">
            {composingSignal === 'WORD' ? 'Welk woord begrijp je niet?' : 'Waar loop je precies vast?'}
          </h2>
          <textarea
            value={signalText}
            onChange={(e) => setSignalText(e.target.value)}
            placeholder={composingSignal === 'WORD' ? 'Typ het woord hier...' : 'Optioneel: leg kort uit wat je niet snapt...'}
            className="w-full p-5 border-2 border-slate-200/60 bg-white/50 rounded-2xl mb-8 min-h-[140px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-400 font-medium text-lg shadow-inner"
            autoFocus
          />
          <div className="flex gap-4">
            <button
              onClick={() => {
                setComposingSignal(null);
                setSignalText('');
              }}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              Annuleren
            </button>
            <button
              onClick={() => sendSignal(composingSignal, signalText)}
              disabled={composingSignal === 'WORD' && !signalText.trim()}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider text-sm"
            >
              Versturen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSignal) {
    return (
      <div className="bg-white/90 backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-2xl border border-white/60 w-full text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100/80 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800 tracking-tight">Verzonden!</h2>
        <p className="text-slate-600 mb-10 font-medium text-lg">De docent heeft je bericht ontvangen.</p>
        <button
          onClick={() => setActiveSignal(null)}
          className="w-full py-4.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all shadow-sm hover:shadow active:scale-95 uppercase tracking-wider text-sm"
        >
          Terug naar opties
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {session.active_phase === 'INSTRUCTIE' && (
        <button 
          onClick={() => setComposingSignal('HELP')}
          className="w-full p-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center gap-5 bg-white/80 backdrop-blur-md border-red-100 text-red-600 hover:border-red-300 hover:bg-red-50 hover:shadow-xl hover:shadow-red-500/10 active:scale-95 group"
        >
          <div className="w-20 h-20 bg-red-50 group-hover:bg-red-100 rounded-[1.5rem] flex items-center justify-center transition-colors">
             <HelpCircle className="w-10 h-10 text-red-400 group-hover:text-red-600 transition-colors" />
          </div>
          <span className="font-bold text-lg tracking-tight">Ik snap het niet</span>
        </button>
      )}

      {session.active_phase === 'CHECK' && (
        <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            onClick={() => sendSignal('CHECK')}
            className="p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-md border-emerald-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-95 group"
          >
            <div className="w-16 h-16 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center transition-colors">
              <CheckCircle className="w-8 h-8 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <span className="font-black text-xl tracking-tight text-center">Ik kan door</span>
          </button>
          
          <button 
            onClick={() => setComposingSignal('HELP')}
            className="p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-md border-amber-100 text-amber-600 hover:border-amber-300 hover:bg-amber-50 hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 group"
          >
            <div className="w-16 h-16 bg-amber-50 group-hover:bg-amber-100 rounded-2xl flex items-center justify-center transition-colors">
              <HelpCircle className="w-8 h-8 text-amber-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="font-black text-xl tracking-tight text-center">Ik twijfel nog</span>
          </button>
        </div>
      )}

      {session.active_phase === 'VERWERKEN' && (
        <div className="flex flex-col gap-4 w-full">
          <button 
            onClick={() => setComposingSignal('HELP')}
            className="w-full p-8 rounded-[2rem] border-2 transition-all flex items-center gap-6 bg-white/80 backdrop-blur-md border-red-100 text-red-600 hover:border-red-300 hover:bg-red-50 hover:shadow-xl hover:shadow-red-500/10 active:scale-95 group"
          >
            <div className="w-16 h-16 bg-red-50 group-hover:bg-red-100 rounded-2xl flex items-center justify-center transition-colors shrink-0">
               <HelpCircle className="w-8 h-8 text-red-400 group-hover:text-red-500 transition-colors" />
            </div>
            <span className="font-bold text-lg tracking-tight">Ik loop vast</span>
          </button>

          <button 
            onClick={() => sendSignal('CHECK')}
            className="w-full p-8 rounded-[2rem] border-2 transition-all flex items-center gap-6 bg-white/80 backdrop-blur-md border-emerald-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-95 group"
          >
            <div className="w-16 h-16 bg-emerald-50 group-hover:bg-emerald-100 rounded-2xl flex items-center justify-center transition-colors shrink-0">
               <CheckCircle className="w-8 h-8 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <span className="font-bold text-lg tracking-tight">Ik ben klaar</span>
          </button>
        </div>
      )}

      {['INSTRUCTIE', 'CHECK', 'VERWERKEN'].includes(session.active_phase) && (
        <button 
          onClick={() => setComposingSignal('WORD')}
          className="w-full mt-4 p-6 rounded-[2rem] border-2 transition-all flex items-center justify-center gap-4 bg-white/80 backdrop-blur-md border-indigo-100/50 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-lg active:scale-95"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
             <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="font-black text-lg">Moeilijk woord melden</span>
        </button>
      )}

      {(session.active_phase === 'START' || session.active_phase === 'AFSLUITING') && (
        <div className="text-center p-12 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-black/5 w-full">
          <p className="text-xl font-bold text-slate-500 leading-relaxed max-w-[250px] mx-auto">
            {session.active_phase === 'START' ? 'Kijk naar het bord voor de start van de les.' : 'De les is afgelopen. Kijk naar het bord.'}
          </p>
        </div>
      )}
    </div>
  );
}
