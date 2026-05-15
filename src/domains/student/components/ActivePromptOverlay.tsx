import React from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { ClassroomPrompt } from '../../../types';

interface ActivePromptOverlayProps {
  activePrompt: ClassroomPrompt;
  promptResponse: string;
  setPromptResponse: (val: string) => void;
  promptSubmitted: boolean;
  sendSignal: (type: 'RESPONSE', text?: string) => void;
}

export function ActivePromptOverlay({
  activePrompt,
  promptResponse,
  setPromptResponse,
  promptSubmitted,
  sendSignal
}: ActivePromptOverlayProps) {
  return (
    <div className={`p-8 rounded-3xl shadow-xl border-2 w-full animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden backdrop-blur-sm ${
      ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'bg-amber-50/90 border-amber-200' :
      ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'bg-emerald-50/90 border-emerald-200' :
      ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'bg-orange-50/90 border-orange-200' :
      'bg-indigo-50/90 border-indigo-200'
    }`}>
      <div className={`flex items-center gap-2 mb-4 ${
        ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'text-amber-600' :
        ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'text-emerald-600' :
        ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'text-orange-600' :
        'text-indigo-600'
      }`}>
        <MessageSquare className="w-6 h-6" />
        <span className="font-bold uppercase tracking-widest text-xs">
          {['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'Bericht van de docent' :
           ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'Reflectievraag' :
           'Vraag van de docent'}
        </span>
      </div>
      <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-tight leading-snug">
        {activePrompt.prompt_text}
      </h2>
      
      {activePrompt.response_mode === 'ACKNOWLEDGE' ? (
        <div className="flex justify-center mt-6">
          {promptSubmitted ? (
            <div className="bg-emerald-100/80 text-emerald-800 p-4 rounded-xl flex items-center justify-center gap-3 w-full border border-emerald-200/50 shadow-sm">
              <CheckCircle className="w-6 h-6" />
              <span className="font-bold">Gelezen!</span>
            </div>
          ) : (
            <button
              onClick={() => sendSignal('RESPONSE', 'Gelezen')}
              className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all shadow-md shadow-amber-500/20 active:translate-y-0.5"
            >
              Ik heb dit gelezen
            </button>
          )}
        </div>
      ) : promptSubmitted ? (
        <div className="bg-emerald-100/80 text-emerald-800 p-5 rounded-xl flex items-center gap-4 border border-emerald-200/50 shadow-sm mt-6">
          <CheckCircle className="w-8 h-8 flex-shrink-0" />
          <span className="font-bold leading-tight">Jouw antwoord is verzonden! Wacht op de docent.</span>
        </div>
      ) : (
        <>
          <textarea
            value={promptResponse}
            onChange={(e) => setPromptResponse(e.target.value)}
            placeholder="Typ hier je antwoord..."
            className="w-full p-4 border-2 border-white/50 bg-white/80 rounded-xl mb-6 min-h-[120px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none resize-none transition-all placeholder:text-slate-400 shadow-sm"
            autoFocus
          />
          <button
            onClick={() => sendSignal('RESPONSE', promptResponse)}
            disabled={!promptResponse.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Verstuur Antwoord
          </button>
        </>
      )}
    </div>
  );
}
