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
    <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl shadow-indigo-900/5 border border-slate-200/60 w-full max-w-3xl mx-auto animate-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-bl-full -mr-32 -mt-32 z-0 mix-blend-multiply opacity-50"></div>
      
      <div className="relative z-10 flex items-center justify-center gap-2 mb-4 text-indigo-600">
        {['HINT', 'CONFIDENCE'].includes(activePrompt.prompt_type) ? (
          <Lightbulb className="w-5 h-5" />
        ) : ['REFLECTION', 'GO_NO_GO', 'EXIT_TICKET'].includes(activePrompt.prompt_type) ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : ['MISCONCEPTION'].includes(activePrompt.prompt_type) ? (
          <HelpCircle className="w-5 h-5" />
        ) : (
          <MessageSquare className="w-5 h-5" />
        )}
        <h2 className="text-xs font-bold tracking-widest uppercase opacity-90">{activePrompt.title}</h2>
      </div>
      <p className="relative z-10 text-xl md:text-2xl font-bold leading-snug text-slate-800 mb-8 max-w-2xl mx-auto text-center">
        {activePrompt.prompt_text}
      </p>
      
      <div className="relative z-10 flex items-center justify-center gap-4">
        <div className="bg-indigo-50/80 backdrop-blur border border-indigo-100/50 text-indigo-700 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2.5 shadow-sm">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-sm"></div>
          {signals.length} {signals.length === 1 ? 'reactie' : 'reacties'}
        </div>
      </div>

      {sharedSignalId && (
        <div className="relative z-10 mt-8 bg-slate-50/80 backdrop-blur p-6 rounded-2xl border border-slate-200/60 animate-in zoom-in-95 duration-500 text-left overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex items-center gap-2 text-indigo-600 mb-3">
            <Lightbulb className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs">Uitgelicht antwoord</span>
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
                <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed italic">
                  "{sharedSignal.text_value}"
                </p>
                {definition && (
                  <div className="mt-4 pt-4 border-t border-slate-200/60">
                    <h4 className="text-[10px] font-bold text-indigo-500 mb-1 uppercase tracking-widest">Betekenis</h4>
                    <p className="text-base text-slate-700 leading-relaxed font-medium">
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
        <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {signals.map((signal, idx) => (
            <div key={signal.id} className="bg-white backdrop-blur p-5 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
              <p className="text-slate-800 text-sm md:text-base italic font-medium leading-snug">"{signal.text_value}"</p>
              <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Leerling {idx + 1}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
