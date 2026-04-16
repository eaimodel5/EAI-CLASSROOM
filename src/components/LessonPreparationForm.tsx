import React, { useState } from "react";
import { LessonPreparation } from "../../types";
import { Plus, Minus, Save, Sparkles, Wand2, Loader2 } from "lucide-react";
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
    <div className="space-y-2">
      <label className="font-medium text-gray-700">{label}</label>

      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
            className="rounded-lg border border-gray-300 px-3 py-2 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={() => {
              if (values.length === 1) {
                onChange([""]);
                return;
              }
              onChange(values.filter((_, i) => i !== index));
            }}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="w-4 h-4" /> Voeg toe
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

  const generateWithAI = async () => {
    if (!prep.subject || !prep.title) {
      alert("Vul minimaal het vak en de titel van de les in om de AI te gebruiken.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Je bent een expert in didactiek en lesontwerp. 
Maak een lesvoorbereiding op basis van de volgende gegevens:
Titel van de les: ${prep.title}
Vak: ${prep.subject}
Klas: ${prep.className || 'Niet gespecificeerd'}
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
      }
    } catch (error) {
      console.error("Fout bij genereren:", error);
      alert("Er ging iets mis bij het genereren. Probeer het opnieuw.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto my-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lesvoorbereiding</h2>
          <p className="text-gray-500 mt-1">Bereid je les voor met leerdoelen, checkvragen en verwachte misconcepties.</p>
        </div>
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-8">
        {/* Basis Info */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Titel van de les</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Bijv. Breuken gelijknamig maken"
              value={prep.title}
              onChange={(e) => setPrep({ ...prep, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Vak</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Bijv. Wiskunde"
              value={prep.subject}
              onChange={(e) => setPrep({ ...prep, subject: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Klas</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Bijv. 2B"
              value={prep.className}
              onChange={(e) => setPrep({ ...prep, className: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Niveau</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Bijv. HAVO"
              value={prep.level}
              onChange={(e) => setPrep({ ...prep, level: e.target.value })}
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Doelen */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="font-medium text-gray-700">Leerdoel</label>
            <button
              type="button"
              onClick={generateWithAI}
              disabled={isGenerating || !prep.subject || !prep.title}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isGenerating ? "AI is aan het schrijven..." : "Auto-aanvullen met AI"}
            </button>
          </div>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
            placeholder="Wat moeten leerlingen aan het eind van de les kennen of kunnen? (Je kunt dit ook leeg laten en door AI laten bedenken)"
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

        <hr className="border-gray-100" />

        {/* Vragen */}
        <div className="bg-indigo-50 -mx-8 px-8 py-6 space-y-6">
          <h3 className="text-lg font-semibold text-indigo-900">Formatieve Vragen (Live inzetbaar)</h3>
          
          <StringListField
            label="Startvragen / Voorkennis"
            placeholder="Vraag om voorkennis te activeren..."
            values={prep.priorKnowledgeQuestions}
            onChange={(priorKnowledgeQuestions) =>
              setPrep({ ...prep, priorKnowledgeQuestions })
            }
          />

          <StringListField
            label="Checkvragen"
            placeholder="Vraag om begrip te checken..."
            values={prep.checkQuestions}
            onChange={(checkQuestions) => setPrep({ ...prep, checkQuestions })}
          />

          <StringListField
            label="Exit-ticketvragen"
            placeholder="Afsluitende vraag..."
            values={prep.exitTicketQuestions}
            onChange={(exitTicketQuestions) =>
              setPrep({ ...prep, exitTicketQuestions })
            }
          />
        </div>

        {/* Misconcepties & Interventies */}
        <StringListField
          label="Verwachte misconcepties"
          placeholder="Veelvoorkomende denkfout..."
          values={prep.misconceptions}
          onChange={(misconceptions) => setPrep({ ...prep, misconceptions })}
        />

        <StringListField
          label="Interventies / feedbackmoves"
          placeholder="Hoe reageer je hierop?..."
          values={prep.interventions}
          onChange={(interventions) => setPrep({ ...prep, interventions })}
        />

        <hr className="border-gray-100" />

        <div className="space-y-2">
          <label className="font-medium text-gray-700">Docentnotities</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
            placeholder="Extra notities voor tijdens de les..."
            value={prep.teacherNotes}
            onChange={(e) => setPrep({ ...prep, teacherNotes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <button
              className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={onCancel}
            >
              Annuleren
            </button>
          )}
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            onClick={() => onSave(prep)}
          >
            <Save className="w-5 h-5" />
            Opslaan & Doorgaan
          </button>
        </div>
      </div>
    </div>
  );
}
