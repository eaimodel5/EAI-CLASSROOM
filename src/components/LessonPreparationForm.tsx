import React, { useState } from "react";
import { LessonPreparation } from "../types";
import { Plus, Minus, Save, Sparkles, Wand2, Loader2, BookOpen, Target, MessageCircleQuestion, AlertTriangle, FileText, ChevronRight, ChevronDown, CheckCircle } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

function StringListField({
  label,
  values,
  onChange,
  placeholder
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="font-bold text-gray-800 text-sm">{label}</label>

      {values.map((value, index) => (
        <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <input
            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-2.5 focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all"
            value={value}
            onChange={(e) => {
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder ? `${placeholder} ${index + 1}` : `${label} ${index + 1}`}
          />

          <button
            type="button"
            className="rounded-xl border-2 border-gray-100 bg-gray-50/50 px-3 py-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={() => {
              if (values.length === 1) {
                onChange([""]);
                return;
              }
              onChange(values.filter((_, i) => i !== index));
            }}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 py-1.5 px-3 rounded-lg transition-colors w-fit"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="w-4 h-4" /> Voeg regel toe
      </button>
    </div>
  );
}

export function LessonPreparationForm({
  initialValue,
  onSave,
  onCancel
}: {
  initialValue: LessonPreparation;
  onSave: (prep: LessonPreparation) => void;
  onCancel?: () => void;
}) {
  const [prep, setPrep] = useState<LessonPreparation>(initialValue);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openSection, setOpenSection] = useState<string>('basis');
  const [genSuccess, setGenSuccess] = useState(false);

  const generateWithAI = async () => {
    if (!prep.subject || !prep.title) {
      alert("Vul minimaal het vak en de titel van de les in om de AI te gebruiken.");
      return;
    }
    
    setIsGenerating(true);
    setGenSuccess(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Je bent een expert in didactiek en lesontwerp. 
Maak een lesvoorbereiding op basis van de volgende gegevens:
Titel van de les: ${prep.title}
Vak: ${prep.subject}
Klas: ${prep.className || 'Niet gespecificeerd'}
Leerjaar: ${prep.gradeYear || 'Niet gespecificeerd'}
Niveau: ${prep.level || 'Niet gespecificeerd'}
Leerdoel: ${prep.learningGoal || 'Bedenk een passend en concreet leerdoel op basis van de titel en het vak.'}

Genereer de volgende onderdelen in het Nederlands:
- learningGoal: Een helder, concreet en meetbaar leerdoel (als dit nog niet was ingevuld of verbeter het bestaande doel).
- successCriteria: Een lijst van 3-5 succescriteria (beginnend met "Ik kan...").
- priorKnowledgeQuestions: 1-2 vragen om voorkennis te activeren.
- checkQuestions: 2-3 formatieve checkvragen om begrip te toetsen tijdens de les.
- misconceptions: 2-3 veelvoorkomende misconcepties of fouten bij dit onderwerp.
- interventions: 1-2 korte interventies of feedback acties voor als leerlingen vastlopen.
- exitTicketQuestions: 1-2 vragen voor een exit ticket aan het eind van de les.
- teacherNotes: Korte didactische tips voor de docent.

Guardrails:
- Gebruik GEEN emoji's of emoticons in de gegenereerde tekst. Houd de toon professioneel en zakelijk.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              learningGoal: { type: Type.STRING },
              successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
              priorKnowledgeQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              checkQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              interventions: { type: Type.ARRAY, items: { type: Type.STRING } },
              exitTicketQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              teacherNotes: { type: Type.STRING }
            },
            required: ["learningGoal", "successCriteria", "priorKnowledgeQuestions", "checkQuestions", "misconceptions", "interventions", "exitTicketQuestions", "teacherNotes"]
          }
        }
      });

      if (response.text) {
        const generated = JSON.parse(response.text);
        setPrep({
          ...prep,
          learningGoal: generated.learningGoal || prep.learningGoal,
          successCriteria: generated.successCriteria || prep.successCriteria,
          priorKnowledgeQuestions: generated.priorKnowledgeQuestions || prep.priorKnowledgeQuestions,
          checkQuestions: generated.checkQuestions || prep.checkQuestions,
          misconceptions: generated.misconceptions || prep.misconceptions,
          interventions: generated.interventions || prep.interventions,
          exitTicketQuestions: generated.exitTicketQuestions || prep.exitTicketQuestions,
          teacherNotes: generated.teacherNotes || prep.teacherNotes
        });
        setGenSuccess(true);
        setTimeout(() => setGenSuccess(false), 4000);
      }
    } catch (error) {
      console.error("Fout bij genereren:", error);
      alert("Er ging iets mis bij het genereren. Probeer het opnieuw.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    { id: 'basis', icon: BookOpen, title: 'Basisinformatie' },
    { id: 'doelen', icon: Target, title: 'Didactische Doelen' },
    { id: 'vragen', icon: MessageCircleQuestion, title: 'Formatieve Vragen' },
    { id: 'knelpunten', icon: AlertTriangle, title: 'Knelpunten & Interventies' },
    { id: 'notities', icon: FileText, title: 'Docentnotities' }
  ];

  return (
    <div className="bg-gray-50/50 rounded-[2rem] border border-gray-100 p-8 md:p-10 max-w-4xl mx-auto my-12 shadow-2xl shadow-blue-900/5 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col mb-10 pb-8 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Nieuwe Sessie Intake
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lesvoorbereiding</h2>
          <p className="text-gray-500 mt-2 font-medium">Volg deze stappen om je les vorm te geven. Gebruik AI om direct een opzet te maken.</p>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          const Icon = section.icon;
          
          return (
            <div key={section.id} className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm ${isOpen ? 'border-blue-200 shadow-blue-50' : 'border-gray-200 hover:border-blue-100 cursor-pointer'}`}>
              {/* Accordion Header */}
              <div 
                className={`flex items-center justify-between p-6 select-none ${isOpen ? '' : ''}`}
                onClick={() => setOpenSection(isOpen ? '' : section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-600'}`}>
                    {section.title}
                  </h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-6 pb-8 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="pt-4 border-t border-gray-100 mt-2">
                    
                    {/* BASICS */}
                    {section.id === 'basis' && (
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <label className="font-bold text-gray-800 text-sm">Titel van de les</label>
                            <input
                              className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Bijv. Breuken gelijknamig maken"
                              value={prep.title}
                              onChange={(e) => setPrep({ ...prep, title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-gray-800 text-sm">Vak</label>
                            <input
                              className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Bijv. Wiskunde"
                              value={prep.subject}
                              onChange={(e) => setPrep({ ...prep, subject: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-gray-800 text-sm">Klas</label>
                            <input
                              className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Bijv. 2B"
                              value={prep.className}
                              onChange={(e) => setPrep({ ...prep, className: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-gray-800 text-sm">Leerjaar</label>
                            <input
                              className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Bijv. 2"
                              value={prep.gradeYear}
                              onChange={(e) => setPrep({ ...prep, gradeYear: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-bold text-gray-800 text-sm">Niveau</label>
                            <input
                              className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                              placeholder="Bijv. HAVO"
                              value={prep.level}
                              onChange={(e) => setPrep({ ...prep, level: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <h4 className="text-blue-900 font-semibold text-sm">Hulp nodig?</h4>
                            <p className="text-xs text-blue-700 mt-0.5">Laat AI de doelen, vragen en misconcepties invullen op basis van de ingevulde gegevens.</p>
                          </div>
                          <button
                            type="button"
                            onClick={generateWithAI}
                            disabled={isGenerating || !prep.subject || !prep.title}
                            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-lg text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                          >
                            {isGenerating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : genSuccess ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Wand2 className="w-4 h-4" />
                            )}
                            {isGenerating ? "Aan het genereren..." : genSuccess ? "Ingevuld!" : "Aanvullen met AI"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DOELEN */}
                    {section.id === 'doelen' && (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <label className="font-bold text-gray-800 text-sm">Centraal Leerdoel</label>
                          <textarea
                            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 min-h-[100px] focus:bg-white focus:ring-0 focus:border-blue-500 outline-none resize-y transition-all placeholder:text-gray-400"
                            placeholder="Wat moeten leerlingen aan het eind van de les kennen of kunnen?"
                            value={prep.learningGoal}
                            onChange={(e) => setPrep({ ...prep, learningGoal: e.target.value })}
                          />
                        </div>

                        <StringListField
                          label="Succescriteria"
                          placeholder="Ik kan..."
                          values={prep.successCriteria}
                          onChange={(successCriteria) => setPrep({ ...prep, successCriteria })}
                        />
                      </div>
                    )}

                    {/* VRAGEN */}
                    {section.id === 'vragen' && (
                      <div className="space-y-8">
                        <StringListField
                          label="Startvragen / Activeren Voorkennis"
                          placeholder="Typ een vraag om voorkennis te peilen..."
                          values={prep.priorKnowledgeQuestions}
                          onChange={(priorKnowledgeQuestions) =>
                            setPrep({ ...prep, priorKnowledgeQuestions })
                          }
                        />

                        <StringListField
                          label="Formatieve Checkvragen"
                          placeholder="Typ een checkvraag tijdens de instructie..."
                          values={prep.checkQuestions}
                          onChange={(checkQuestions) => setPrep({ ...prep, checkQuestions })}
                        />

                        <StringListField
                          label="Exit-tickets / Afsluiting"
                          placeholder="Typ een afrondende reflectievraag..."
                          values={prep.exitTicketQuestions}
                          onChange={(exitTicketQuestions) =>
                            setPrep({ ...prep, exitTicketQuestions })
                          }
                        />
                      </div>
                    )}

                    {/* KNELPUNTEN */}
                    {section.id === 'knelpunten' && (
                      <div className="space-y-8">
                        <StringListField
                          label="Verwachte misconcepties"
                          placeholder="Veelvoorkomende denkfout..."
                          values={prep.misconceptions}
                          onChange={(misconceptions) => setPrep({ ...prep, misconceptions })}
                        />
                        <div className="h-px bg-gray-100 my-4 w-full"></div>
                        <StringListField
                          label="Geplande acties / feedbackmoves"
                          placeholder="Hoe reageer je hierop?..."
                          values={prep.interventions}
                          onChange={(interventions) => setPrep({ ...prep, interventions })}
                        />
                      </div>
                    )}

                    {/* NOTITIES */}
                    {section.id === 'notities' && (
                      <div className="space-y-2">
                        <textarea
                          className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 min-h-[120px] focus:bg-white focus:ring-0 focus:border-blue-500 outline-none resize-y transition-all placeholder:text-gray-400"
                          placeholder="Persoonlijke krabbels of geheugensteuntjes voor tijdens de les..."
                          value={prep.teacherNotes}
                          onChange={(e) => setPrep({ ...prep, teacherNotes: e.target.value })}
                        />
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-10 mt-6">
        {onCancel ? (
          <button
            className="px-8 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors text-center w-full sm:w-auto"
            onClick={onCancel}
          >
            Annuleren
          </button>
        ) : <div />}
        <button
          className="group flex items-center justify-center gap-2 px-10 py-4 border border-blue-600 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 w-full sm:w-auto"
          onClick={() => onSave(prep)}
        >
          Start Digibord & Sessie
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
