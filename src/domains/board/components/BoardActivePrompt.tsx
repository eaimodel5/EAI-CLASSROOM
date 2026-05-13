import React from 'react';
import { Lightbulb, CheckCircle2, HelpCircle, MessageSquare } from 'lucide-react';
import { ClassroomPrompt, ClassroomSignal } from '../../../types';

interface BoardActivePromptProps {
  activePrompt: ClassroomPrompt;
  signals: ClassroomSignal[];
  sharedSignalId: string | null;
  allSignals: ClassroomSignal[];
}

export function BoardActivePrompt({ activePrompt, signals, sharedSignalId, allSignals }: BoardActivePromptProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-16 rounded-[4rem] shadow-2xl border border-white/60 w-full max-w-5xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-bl-full -mr-32 -mt-32 z-0 mix-blend-multiply opacity-50"></div>
      
      <div className="relative z-10 flex items-center justify-center gap-4 mb-8 text-indigo-600">
        {['HINT', 'CONFIDENCE'].includes(activePrompt.prompt_type) ? (
          <Lightbulb className="w-8 h-8" />
        ) : ['REFLECTION', 'GO_NO_GO', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? (
          <CheckCircle2 className="w-8 h-8" />
        ) : ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? (
          <HelpCircle className="w-8 h-8" />
        ) : (
          <MessageSquare className="w-8 h-8" />
        )}
        <h2 className="text-xl font-bold tracking-widest uppercase opacity-80">{activePrompt.title}</h2>
      </div>
      <p className="relative z-10 text-3xl md:text-5xl font-bold leading-relaxed text-slate-800 mb-12 drop-shadow-sm text-center">
        {activePrompt.prompt_text}
      </p>
      
      <div className="relative z-10 flex items-center justify-center gap-4">
        <div className="bg-indigo-100/80 backdrop-blur border border-indigo-200/60 text-indigo-800 px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-4 shadow-sm">
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse shadow-sm"></div>
          {signals.length} {signals.length === 1 ? 'reactie' : 'reacties'} ontvangen
        </div>
      </div>

      {sharedSignalId && (
        <div className="relative z-10 mt-16 bg-white/90 backdrop-blur p-10 rounded-3xl shadow-xl border border-indigo-100 animate-in zoom-in-95 duration-500 text-left overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-indigo-500"></div>
          <div className="flex items-center gap-3 text-indigo-600 mb-6">
            <Lightbulb className="w-8 h-8" />
            <span className="font-bold uppercase tracking-widest text-lg">Uitgelicht antwoord</span>
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
                <p className="text-3xl md:text-4xl text-slate-800 font-medium leading-relaxed italic">
                  "{sharedSignal.text_value}"
                </p>
                {definition && (
                  <div className="mt-8 pt-8 border-t border-slate-100/50">
                    <h4 className="text-sm font-bold text-indigo-500 mb-2 uppercase tracking-widest">Betekenis</h4>
                    <p className="text-2xl text-slate-700 leading-relaxed font-medium">
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
        <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {signals.map((signal, idx) => (
            <div key={signal.id} className="bg-white/80 backdrop-blur p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <p className="text-slate-800 text-xl italic font-medium">"{signal.text_value}"</p>
              <div className="mt-6 text-xs text-slate-400 font-bold uppercase tracking-widest">Leerling {idx + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
