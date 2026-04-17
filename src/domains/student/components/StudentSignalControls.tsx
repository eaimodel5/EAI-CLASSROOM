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
      <div className="bg-white p-6 rounded-2xl shadow-sm border w-full animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {composingSignal === 'WORD' ? 'Welk woord begrijp je niet?' : 'Waar loop je precies vast?'}
        </h2>
        <textarea
          value={signalText}
          onChange={(e) => setSignalText(e.target.value)}
          placeholder={composingSignal === 'WORD' ? 'Typ het woord hier...' : 'Optioneel: leg kort uit wat je niet snapt...'}
          className="w-full p-3 border rounded-lg mb-4 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={() => {
              setComposingSignal(null);
              setSignalText('');
            }}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={() => sendSignal(composingSignal, signalText)}
            disabled={composingSignal === 'WORD' && !signalText.trim()}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            Versturen
          </button>
        </div>
      </div>
    );
  }

  if (activeSignal) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border w-full text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Verzonden!</h2>
        <p className="text-gray-600 mb-6">De docent heeft je bericht ontvangen.</p>
        <button
          onClick={() => setActiveSignal(null)}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
        >
          Terug naar opties
        </button>
      </div>
    );
  }

  return (
    <>
      {session.active_phase === 'INSTRUCTIE' && (
        <button 
          onClick={() => setComposingSignal('HELP')}
          className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 active:scale-95"
        >
          <HelpCircle className="w-10 h-10 text-gray-400" />
          <span className="font-bold text-lg">Ik snap het niet</span>
        </button>
      )}

      {session.active_phase === 'CHECK' && (
        <>
          <button 
            onClick={() => sendSignal('CHECK')}
            className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 active:scale-95"
          >
            <CheckCircle className="w-10 h-10 text-gray-400" />
            <span className="font-bold text-lg">Ik kan door</span>
          </button>
          
          <button 
            onClick={() => setComposingSignal('HELP')}
            className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50 active:scale-95"
          >
            <HelpCircle className="w-10 h-10 text-gray-400" />
            <span className="font-bold text-lg">Ik twijfel nog</span>
          </button>
        </>
      )}

      {session.active_phase === 'VERWERKEN' && (
        <>
          <button 
            onClick={() => setComposingSignal('HELP')}
            className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-red-200 hover:bg-red-50 active:scale-95"
          >
            <HelpCircle className="w-10 h-10 text-gray-400" />
            <span className="font-bold text-lg">Ik loop vast</span>
          </button>

          <button 
            onClick={() => sendSignal('CHECK')}
            className="w-full p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 bg-white border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 active:scale-95"
          >
            <CheckCircle className="w-10 h-10 text-gray-400" />
            <span className="font-bold text-lg">Ik ben klaar</span>
          </button>
        </>
      )}

      {['INSTRUCTIE', 'CHECK', 'VERWERKEN'].includes(session.active_phase) && (
        <button 
          onClick={() => setComposingSignal('WORD')}
          className="w-full mt-4 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 bg-white border-blue-100 text-blue-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="font-bold">Moeilijk woord melden</span>
        </button>
      )}

      {(session.active_phase === 'START' || session.active_phase === 'AFSLUITING') && (
        <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-black/5 w-full">
          <p className="text-lg font-medium text-gray-600">
            {session.active_phase === 'START' ? 'Kijk naar het bord voor de start van de les.' : 'De les is afgelopen. Kijk naar het bord.'}
          </p>
        </div>
      )}
    </>
  );
}
