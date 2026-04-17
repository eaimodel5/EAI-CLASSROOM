import React from 'react';
import { Sparkles, CheckCircle2, HelpCircle, MessageSquare } from 'lucide-react';
import { ClassroomPrompt, ClassroomSignal } from '../../../types';

interface BoardActivePromptProps {
  activePrompt: ClassroomPrompt;
  signals: ClassroomSignal[];
  sharedSignalId: string | null;
  allSignals: ClassroomSignal[];
}

export function BoardActivePrompt({ activePrompt, signals, sharedSignalId, allSignals }: BoardActivePromptProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[3rem] shadow-xl border border-black/5 w-full max-w-4xl animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-center gap-4 mb-8 text-indigo-600">
        {['HINT', 'CONFIDENCE'].includes(activePrompt.prompt_type) ? (
          <Sparkles className="w-12 h-12" />
        ) : ['REFLECTION', 'GO_NO_GO', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? (
          <CheckCircle2 className="w-12 h-12" />
        ) : ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? (
          <HelpCircle className="w-12 h-12" />
        ) : (
          <MessageSquare className="w-12 h-12" />
        )}
        <h2 className="text-3xl font-bold tracking-tight uppercase">{activePrompt.title}</h2>
      </div>
      <p className="text-5xl md:text-6xl font-medium leading-tight text-gray-900 mb-12">
        {activePrompt.prompt_text}
      </p>
      
      <div className="flex items-center justify-center gap-4">
        <div className="bg-indigo-100 text-indigo-800 px-6 py-3 rounded-full text-xl font-medium flex items-center gap-3">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          {signals.length} {signals.length === 1 ? 'reactie' : 'reacties'} ontvangen
        </div>
      </div>

      {sharedSignalId && (
        <div className="mt-12 bg-white p-8 rounded-3xl shadow-lg border-2 border-indigo-200 animate-in zoom-in-95 duration-500 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <Sparkles className="w-6 h-6" />
            <span className="font-bold uppercase tracking-widest text-sm">Uitgelicht antwoord</span>
          </div>
          {(() => {
            const sharedSignal = allSignals.find(s => s.id === sharedSignalId);
            if (!sharedSignal) return null;
            
            let definition = null;
            if (sharedSignal.signal_type === 'WORD' && sharedSignal.payload_json) {
              try {
                const payload = JSON.parse(sharedSignal.payload_json);
                definition = payload.definition;
              } catch (e) {}
            }

            return (
              <>
                <p className="text-3xl md:text-4xl text-gray-800 font-medium leading-relaxed italic">
                  "{sharedSignal.text_value}"
                </p>
                {definition && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wider">Betekenis</h4>
                    <p className="text-2xl text-gray-700 leading-relaxed">
                      {definition}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {activePrompt.prompt_type === 'PEER_FEEDBACK' && signals.length > 0 && !sharedSignalId && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {signals.map((signal, idx) => (
            <div key={signal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <p className="text-gray-800 text-lg italic">"{signal.text_value}"</p>
              <div className="mt-4 text-sm text-gray-400 font-medium uppercase tracking-wider">Leerling {idx + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
