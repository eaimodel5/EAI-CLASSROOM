import React from 'react';
import { Lightbulb, MessageSquare } from 'lucide-react';
import { ClassroomSession, ClassroomSignal, LessonPreparation } from '../../../types';

interface BoardSharedSignalProps {
  session: ClassroomSession;
  allSignals: ClassroomSignal[];
  signals: ClassroomSignal[];
}

export function BoardSharedSignal({ session, allSignals, signals }: BoardSharedSignalProps) {
  if (!session.shared_signal_id) {
    const prep: LessonPreparation | null = session.prep_json ? JSON.parse(session.prep_json) : null;
    
    let phaseContent = null;
    
    if (prep) {
      if (session.active_phase === 'START' && prep.priorKnowledgeQuestions && prep.priorKnowledgeQuestions[0]) {
        phaseContent = (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Start Vraag</h3>
            {prep.priorKnowledgeQuestions.filter(Boolean).map((q, i) => (
              <p key={i} className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{q}</p>
            ))}
          </div>
        );
      } else if (session.active_phase === 'INSTRUCTIE' && prep.instructionActivities && prep.instructionActivities[0]) {
        phaseContent = (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Tijdens de instructie</h3>
            {prep.instructionActivities.filter(Boolean).map((q, i) => (
              <p key={i} className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{q}</p>
            ))}
          </div>
        );
      } else if (session.active_phase === 'CHECK' && prep.checkQuestions && prep.checkQuestions[0]) {
        phaseContent = (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">Formatieve Check</h3>
            {prep.checkQuestions.filter(Boolean).map((q, i) => (
              <p key={i} className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{q}</p>
            ))}
          </div>
        );
      } else if (session.active_phase === 'VERWERKEN' && prep.processingActivities && prep.processingActivities[0]) {
        phaseContent = (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Verwerkingsopdracht</h3>
            {prep.processingActivities.filter(Boolean).map((q, i) => (
              <p key={i} className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{q}</p>
            ))}
          </div>
        );
      } else if (session.active_phase === 'AFSLUITING' && prep.exitTicketQuestions && prep.exitTicketQuestions[0]) {
        phaseContent = (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3">Afsluiting</h3>
            {prep.exitTicketQuestions.filter(Boolean).map((q, i) => (
              <p key={i} className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{q}</p>
            ))}
          </div>
        );
      }
    }

    return (
      <>
          <div className="space-y-4 mb-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl w-full mx-auto bg-white/60 backdrop-blur p-6 rounded-2xl border border-slate-200/50 shadow-md">
            {phaseContent || (
              <>
                {session.lesson_goal ? (
                  <>
                    <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Het Lesdoel van Vandaag</h3>
                    <p className="text-base md:text-lg lg:text-xl font-bold leading-relaxed text-slate-800 drop-shadow-sm">{session.lesson_goal}</p>
                  </>
                ) : (
                  <div className="text-lg md:text-xl font-bold text-slate-800/40 animate-pulse">
                    Kijk naar de docent voor instructies.
                  </div>
                )}
              </>
            )}
          </div>

        {session.active_phase === 'CHECK' && (
          <div className="w-full max-w-2xl mt-6 grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-500/5 text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-5xl font-black text-emerald-500 mb-2 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'CHECK').length}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-800/70">Kunnen door</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-amber-100 shadow-lg shadow-amber-500/5 text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-5xl font-black text-amber-500 mb-2 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'HELP').length}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-amber-800/70">Twijfelen nog</div>
            </div>
          </div>
        )}

        {session.active_phase === 'VERWERKEN' && (
          <div className="w-full max-w-2xl mt-6 grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-500/5 text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-5xl font-black text-emerald-500 mb-2 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'CHECK').length}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-800/70">Zijn klaar</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-red-100 shadow-lg shadow-red-500/5 text-center transform hover:scale-105 transition-transform">
              <div className="text-3xl md:text-5xl font-black text-red-500 mb-2 drop-shadow-sm">
                {signals.filter(s => s.signal_type === 'HELP').length}
              </div>
              <div className="text-sm font-bold uppercase tracking-widest text-red-800/70">Lopen vast</div>
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
    <div className="w-full max-w-3xl mt-6 bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-xl border border-indigo-50 animate-in zoom-in-95 duration-500 text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/40 rounded-bl-full -mr-32 -mt-32 z-0 mix-blend-multiply opacity-50"></div>
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
      
      <div className="relative z-10 flex items-center gap-3 text-indigo-600 mb-6">
        <Lightbulb className="w-6 h-6" />
        <span className="font-bold uppercase tracking-widest text-sm">Uitgelicht op het bord</span>
      </div>
      
      {sharedSignal.signal_type === 'DRAWING' ? (
        <div className="relative z-10 w-full bg-slate-50/50 backdrop-blur-sm border-2 border-dashed border-slate-200/60 rounded-[2rem] p-6 flex justify-center">
          <img src={sharedSignal.text_value || ''} alt="Gedeelde tekening" className="max-w-full h-auto rounded-xl shadow-lg border border-white" />
        </div>
      ) : (
        <p className="relative z-10 text-lg md:text-xl text-slate-800 font-medium leading-relaxed mb-6 italic drop-shadow-sm">
          "{sharedSignal.text_value}"
        </p>
      )}

      {definition && (
        <div className="relative z-10 mt-6 pt-6 border-t border-slate-100/50">
          <h4 className="text-xs font-bold text-indigo-500 mb-1 uppercase tracking-widest">Betekenis</h4>
          <p className="text-lg text-slate-700 leading-relaxed font-medium">
            {definition}
          </p>
        </div>
      )}
    </div>
  );
}
