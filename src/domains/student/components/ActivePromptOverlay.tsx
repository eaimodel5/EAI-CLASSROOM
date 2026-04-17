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
    <div className={`p-6 rounded-2xl shadow-sm border-2 w-full animate-in fade-in slide-in-from-bottom-4 ${
      ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'bg-amber-50 border-amber-200' :
      ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'bg-emerald-50 border-emerald-200' :
      ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'bg-orange-50 border-orange-200' :
      'bg-white border-indigo-200'
    }`}>
      <div className={`flex items-center gap-2 mb-2 ${
        ['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'text-amber-600' :
        ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'text-emerald-600' :
        ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? 'text-orange-600' :
        'text-indigo-600'
      }`}>
        <MessageSquare className="w-5 h-5" />
        <span className="font-semibold uppercase tracking-wider text-xs">
          {['HINT', 'CLASS_INTERVENTION'].includes(activePrompt.prompt_type) ? 'Bericht van de docent' :
           ['REFLECTION', 'CONFIDENCE', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? 'Reflectievraag' :
           'Vraag van de docent'}
        </span>
      </div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        {activePrompt.prompt_text}
      </h2>
      
      {activePrompt.response_mode === 'ACKNOWLEDGE' ? (
        <div className="flex justify-center mt-6">
          {promptSubmitted ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 w-full">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Gelezen!</span>
            </div>
          ) : (
            <button
              onClick={() => sendSignal('RESPONSE', 'Gelezen')}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Ik heb dit gelezen
            </button>
          )}
        </div>
      ) : promptSubmitted ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">Jouw antwoord is verzonden! Wacht op de docent.</span>
        </div>
      ) : (
        <>
          <textarea
            value={promptResponse}
            onChange={(e) => setPromptResponse(e.target.value)}
            placeholder="Typ hier je antwoord..."
            className="w-full p-3 border rounded-lg mb-4 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            autoFocus
          />
          <button
            onClick={() => sendSignal('RESPONSE', promptResponse)}
            disabled={!promptResponse.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            Verstuur Antwoord
          </button>
        </>
      )}
    </div>
  );
}
