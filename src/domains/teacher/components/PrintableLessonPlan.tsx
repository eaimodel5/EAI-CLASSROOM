import React from 'react';
import { LessonPreparation } from '../../../types';
import { ArrowLeft, Printer, Target, AlertTriangle, MessageSquare, CheckSquare } from 'lucide-react';

export function PrintableLessonPlan({ prep, onBack }: { prep: LessonPreparation, onBack: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full bg-white relative animate-in fade-in duration-500 rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:bg-white print:block print:overflow-visible">
      {/* Screen only header */}
      <div className="bg-slate-100 p-6 border-b border-slate-200 flex justify-between items-center print:hidden rounded-t-3xl backdrop-blur-xl">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" /> Terug
        </button>
        <div className="flex gap-4 items-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest hidden md:inline">Klaar voor de start</span>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all">
                <Printer className="w-5 h-5" />
                Printen / Opslaan
            </button>
        </div>
      </div>

      {/* Print Content Container */}
      <div className="p-8 md:p-12 print:p-0 max-w-4xl mx-auto space-y-24 bg-white print:block">
          
          <div className="print-container print:block">
            {/* --- PAGE 1: LESSON PLAN OVERVIEW --- */}
            <div className="space-y-8 bg-white print:p-8 print:block">
              <div className="border-b-4 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
                <div>
                  <div className="text-indigo-600 font-black tracking-widest uppercase text-sm mb-2">{prep.subject} {prep.className ? `• ${prep.className}` : ''} {prep.gradeYear ? `• ${prep.gradeYear}` : ''} {prep.level ? `• ${prep.level}` : ''}</div>
                  <h1 className="text-3xl lg:text-4xl print:text-2xl font-black text-slate-900 tracking-tight">{prep.title}</h1>
                </div>
                <div className="text-right">
                  <div className="w-20 h-20 bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center justify-center font-black text-2xl text-indigo-300">
                    EAI
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 print:block">
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 print:break-inside-avoid print:mb-8">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-4">
                        <Target className="w-6 h-6 text-indigo-500" />
                        Lesdoel
                    </h2>
                    <p className="text-slate-700 text-lg font-medium leading-relaxed">{prep.learningGoal || "Geen lesdoel opgegeven."}</p>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 print:break-inside-avoid print:mb-8">
                    <h2 className="text-xl font-black text-indigo-900 flex items-center gap-3 mb-4">
                        <CheckSquare className="w-6 h-6 text-indigo-500" />
                        Succescriteria
                    </h2>
                    <ul className="space-y-3">
                        {prep.successCriteria && prep.successCriteria.length > 0 && prep.successCriteria[0] !== '' ? prep.successCriteria.map((c, i) => (
                            <li key={i} className="flex gap-3 text-indigo-800 font-medium">
                                <span className="font-bold text-indigo-400">•</span>
                                {c}
                            </li>
                        )) : (
                            <li className="text-indigo-800/50 font-medium italic">Geen succescriteria.</li>
                        )}
                    </ul>
                </div>
              </div>

              <div className="space-y-6 print:break-inside-avoid">
                  <h2 className="text-2xl font-black text-slate-800 border-b-2 border-slate-100 pb-2">Verwachte Knelpunten & Interventies</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
                    <div className="print:mb-8 print:break-inside-avoid">
                        <h3 className="text-slate-500 uppercase tracking-widest font-black text-xs mb-4">Misconcepties</h3>
                        <ul className="space-y-3">
                            {prep.misconceptions && prep.misconceptions.length > 0 && prep.misconceptions[0] !== '' ? prep.misconceptions.map((m, i) => (
                                <li key={i} className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-900 font-medium text-sm flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                    {m}
                                </li>
                            )) : (
                                <li className="text-slate-500 italic">Geen misconcepties genoteerd.</li>
                            )}
                        </ul>
                    </div>
                    <div className="print:mb-8 print:break-inside-avoid">
                        <h3 className="text-slate-500 uppercase tracking-widest font-black text-xs mb-4">Geplande Acties</h3>
                        <ul className="space-y-3">
                            {prep.interventions && prep.interventions.length > 0 && prep.interventions[0] !== '' ? prep.interventions.map((m, i) => (
                                <li key={i} className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 font-medium text-sm flex gap-3">
                                    <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
                                    {m}
                                </li>
                            )) : (
                                <li className="text-slate-500 italic">Geen geplande acties genoteerd.</li>
                            )}
                        </ul>
                    </div>
                  </div>
              </div>

              {prep.teacherNotes && (
                <div className="mt-12 p-8 bg-slate-800 print:bg-slate-50 print:border-2 print:border-slate-200 text-slate-100 print:text-slate-800 rounded-3xl print:break-inside-avoid">
                  <h2 className="text-xl font-black text-white print:text-slate-800 mb-4">Persoonlijke Notities & Didactische Aanpak</h2>
                  <p className="whitespace-pre-wrap font-medium text-slate-300 print:text-slate-700 leading-relaxed disabled">{prep.teacherNotes}</p>
                </div>
              )}
            </div>

            {/* --- PAGE 2: LESSON CARDS --- */}
            <div className="print:break-before-page mt-24 print:mt-0 print:p-8 print:block">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-slate-800">Leskaarten</h2>
                    <p className="text-slate-500 font-medium mt-2">Knip deze uit of houd ze bij de hand tijdens de les.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
                    {/* Voorkennis Cards */}
                    {prep.priorKnowledgeQuestions && prep.priorKnowledgeQuestions.length > 0 && prep.priorKnowledgeQuestions[0] !== '' && prep.priorKnowledgeQuestions.map((q, i) => (
                        <div key={`prior-${i}`} className="print:mb-8 print:break-inside-avoid bg-white border-4 border-indigo-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-[250px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">Startfase</div>
                            <h3 className="text-slate-400 uppercase tracking-widest font-black text-xs mb-6 mt-4">Activeren Voorkennis</h3>
                            <p className="text-xl font-bold text-slate-800 leading-relaxed flex-1 whitespace-pre-wrap">{q}</p>
                        </div>
                    ))}

                    {/* Check Questions Cards */}
                    {prep.checkQuestions && prep.checkQuestions.length > 0 && prep.checkQuestions[0] !== '' && prep.checkQuestions.map((q, i) => (
                        <div key={`check-${i}`} className="print:mb-8 print:break-inside-avoid bg-white border-4 border-amber-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-[250px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">Instructiefase</div>
                            <h3 className="text-slate-400 uppercase tracking-widest font-black text-xs mb-6 mt-4">Formatieve Check</h3>
                            <p className="text-xl font-bold text-slate-800 leading-relaxed flex-1 whitespace-pre-wrap">{q}</p>
                        </div>
                    ))}

                    {/* Exit Tickets Cards */}
                    {prep.exitTicketQuestions && prep.exitTicketQuestions.length > 0 && prep.exitTicketQuestions[0] !== '' && prep.exitTicketQuestions.map((q, i) => (
                        <div key={`exit-${i}`} className="print:mb-8 print:break-inside-avoid bg-white border-4 border-emerald-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col min-h-[250px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">Afsluiting</div>
                            <h3 className="text-slate-400 uppercase tracking-widest font-black text-xs mb-6 mt-4">Exit-Ticket</h3>
                            <p className="text-xl font-bold text-slate-800 leading-relaxed flex-1 whitespace-pre-wrap">{q}</p>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      </div>
    </div>
  );
}

