import React, { useState, useEffect } from "react";
import { LessonPreparation } from "../types";
import { Plus, Minus, Save, Wand2, Loader2, BookOpen, Target, MessageCircleQuestion, AlertTriangle, FileText, ChevronRight, ChevronLeft, CheckCircle, Check, PlayCircle, Library, Search, X, PanelLeftClose } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface LessonTemplateDoc {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  prep_json: string;
  created_by: string;
}

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
      <label className="font-bold text-slate-800 text-sm tracking-wide">{label}</label>

      {values.map((value, index) => (
        <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
          <textarea
            className="w-full rounded-xl border-2 border-slate-200/60 bg-slate-50/50 px-3 py-2 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 overflow-hidden resize-none min-h-[44px] text-sm"
            rows={1}
            value={value}
            ref={(el) => {
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            onChange={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
              const next = [...values];
              next[index] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder ? `${placeholder} ${index + 1}` : `${label} ${index + 1}`}
          />

          <button
            type="button"
            className="rounded-xl border-2 border-slate-200/60 bg-slate-50/50 px-3 py-3 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
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
        className="flex items-center gap-2 text-sm text-indigo-600 font-bold hover:text-indigo-700 hover:bg-indigo-50 py-2 px-4 rounded-xl transition-colors w-fit border border-transparent hover:border-indigo-100"
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
  onChoosePrint,
  onCancel
}: {
  initialValue: LessonPreparation;
  onSave: (prep: LessonPreparation) => void;
  onChoosePrint?: (prep: LessonPreparation) => void;
  onCancel?: () => void;
}) {
  const [prep, setPrep] = useState<LessonPreparation>(initialValue);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [genSuccess, setGenSuccess] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [libraryTemplates, setLibraryTemplates] = useState<LessonTemplateDoc[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const fetchLibrary = async () => {
    setLibraryLoading(true);
    setShowLibrary(true);
    try {
      const q = query(collection(db, "lesson_templates"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      const items: LessonTemplateDoc[] = [];
      snap.forEach(d => {
        items.push({ id: d.id, ...d.data() } as LessonTemplateDoc);
      });
      setLibraryTemplates(items);
    } catch(err) {
      console.error(err);
      alert('Kon bibliotheek niet laden');
    } finally {
      setLibraryLoading(false);
    }
  };

  const generateWithAI = async () => {
    if (!prep.subject || !prep.title) {
      alert("Vul minimaal het vak en het lesdoel in om de AI te gebruiken.");
      return;
    }
    
    setIsGenerating(true);
    setGenSuccess(false);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Je bent een vakdidactisch expert en ervaren docent met een focus op actieve didactiek. 
Maak een uitgebreide en rijke lesvoorbereiding op basis van de volgende gegevens:
Lesdoel / Onderwerp: ${prep.title}
Vak: ${prep.subject}
Klas: ${prep.className || 'Niet gespecificeerd'}
Leerjaar: ${prep.gradeYear || 'Niet gespecificeerd'}
Niveau: ${prep.level || 'Niet gespecificeerd'}
Leerdoel: ${prep.learningGoal || 'Bedenk een passend en concreet leerdoel op basis van de titel en het vak.'}

Genereer de volgende onderdelen in vloeiend, professioneel Nederlands en zorg voor didactische diepgang:
- learningGoal: Een helder, concreet en meetbaar (SMART) leerdoel dat direct richting geeft aan de les.
- successCriteria: Een rijke lijst van 3-5 specifieke, direct te toetsen succescriteria (bijv: "Aan het eind van de les kan de leerling...").
- priorKnowledgeQuestions: 2-3 uitdagende, conceptuele startvragen (voor op de leskaarten) om voorkennis te activeren. Raak de kern van het nieuwe onderwerp. Geen gesloten vragen.
- instructionActivities: 1-2 actieve of reflectieve denkvragen/werkvormen tijdens de instructie om leerlingen betrokken te houden.
- checkQuestions: 3-4 formatieve checkvragen (denk aan conceptuele denkvragen). Formuleer ze zo dat ze direct in de klas gesteld kunnen worden. Inclusief evt. een korte opmerking: "(Let op:...)"
- processingActivities: 1-3 heldere opdrachten of verwerkingstaken voor de fase 'Verwerken'.
- misconceptions: 3 uitgewerkte veelvoorkomende misconcepties: Wat denkt de leerling verkeerd en waarom?
- interventions: 2-3 concrete formatieve interventies of hints voor als het misgaat (bijv. "Als een leerling vastloopt, stel dan de vraag...").
- exitTicketQuestions: 2 formatief ijzersterke exit-ticket opdrachten. Geen simpele vragen als "wat is het belangrijkste", maar een inhoudelijke, korte denkopdracht (bijv. "Leg in je eigen woorden uit waarom X leidt tot Y" of "Welke van deze twee stellingen klopt en waarom?"). Dit moet perfect toetsen of de succescriteria behaald zijn.
- teacherNotes: Een uitgebreide didactische compacte handleiding: tips voor differentiatie, aanpak van tempoverschillen, en het 'waarom' van deze lesopbouw.

Guardrails:
- Gebruik GEEN emoji's of emoticons in de gegenereerde tekst. Houd de toon professioneel, vakkundig en zakelijk.
- Focus op formatief handelen en de actieve betrokkenheid van de leerling bij het lesdoel.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              learningGoal: { type: Type.STRING },
              successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
              priorKnowledgeQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructionActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
              checkQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              processingActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
              misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              interventions: { type: Type.ARRAY, items: { type: Type.STRING } },
              exitTicketQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              teacherNotes: { type: Type.STRING }
            },
            required: ["learningGoal", "successCriteria", "priorKnowledgeQuestions", "instructionActivities", "checkQuestions", "processingActivities", "misconceptions", "interventions", "exitTicketQuestions", "teacherNotes"]
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
          instructionActivities: generated.instructionActivities || prep.instructionActivities,
          checkQuestions: generated.checkQuestions || prep.checkQuestions,
          processingActivities: generated.processingActivities || prep.processingActivities,
          misconceptions: generated.misconceptions || prep.misconceptions,
          interventions: generated.interventions || prep.interventions,
          exitTicketQuestions: generated.exitTicketQuestions || prep.exitTicketQuestions,
          teacherNotes: generated.teacherNotes || prep.teacherNotes
        });
        setGenSuccess(true);
        // Automatically progress to next step to show results
        setTimeout(() => {
          setGenSuccess(false);
          setActiveStep(1);
        }, 1500);
      }
    } catch (error) {
      console.error("Fout bij genereren:", error);
      alert("Er ging iets mis bij het genereren. Probeer het opnieuw.");
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { id: 'basis', icon: BookOpen, title: 'Basisinformatie', isComplete: !!prep.title && !!prep.subject },
    { id: 'doelen', icon: Target, title: 'Doelen', isComplete: !!prep.learningGoal },
    { id: 'vragen', icon: MessageCircleQuestion, title: 'Formatieve Vragen', isComplete: prep.checkQuestions.length > 0 && !!prep.checkQuestions[0] },
    { id: 'knelpunten', icon: AlertTriangle, title: 'Knelpunten', isComplete: prep.misconceptions.length > 0 && !!prep.misconceptions[0] },
    { id: 'notities', icon: FileText, title: 'Notities', isComplete: !!prep.teacherNotes }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
  };

  const handlePrev = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleDemoLes = () => {
    setPrep({
      title: "De Franse Revolutie: Oorzaken",
      subject: "Geschiedenis",
      className: "3A",
      gradeYear: "3 HAVO/VWO",
      level: "Mix",
      learningGoal: "Aan het eind van de les kunnen leerlingen de drie belangrijkste oorzaken van de Franse Revolutie benoemen en uitleggen hoe de standensamenleving hierbij een rol speelde.",
      successCriteria: [
        "Ik kan uitleggen hoe de inrichting van de standensamenleving zorgde voor oneerlijkheid.",
        "Ik kan drie redenen noemen waarom de derde stand in opstand kwam.",
        "Ik kan met een voorbeeld uitleggen waarom de verlichting een oorzaak was van de revolutie."
      ],
      priorKnowledgeQuestions: [
        "Welke verschillen in macht en rijkdom zagen we in de eerdere tijdvakken tussen de heer en de boer? Hoe zou dat nu zijn?",
        "Bedenk een situatie van vandaag de dag waarbij jij het gevoel hebt dat regels oneerlijk verdeeld zijn. Hoe voelt dat?"
      ],
      instructionActivities: [
        "Bespreek tijdens de uitleg over de standenmaatschappij wie de minste macht had en waarom.",
        "Korte denkvraag: Wat zou jij doen als je in 1788 in de derde stand geboren was?"
      ],
      checkQuestions: [
        "Leg de buurvrouw uit waarom een rijke koopman in deze tijd ontevreden was met het systeem, ondanks dat hij wel geld had.",
        "Kijkend naar de drie standen: wie heeft volgens jou de meeste macht en waarom?"
      ],
      processingActivities: [
        "Maak in tweetallen een overzicht van de drie standen met hun rechten en plichten.",
        "Werkblad 2.1: Analyse van een spotprent uit de Franse Revolutie."
      ],
      misconceptions: [
        "De revolutie begon omdat iedereen alleen maar honger had (Nee, ook over belasting & politieke inspraak).",
        "Alleen arme boeren kwamen in opstand (Nee, ook rijke advocaten en artsen)."
      ],
      interventions: [
        "Teken de standenpiramide op het bord om het visueel te maken.",
        "Vraag: 'Als jij 50% belasting betaalt en je buurman 0%, wat gebeurt er dan met jouw respect voor de overheid?'"
      ],
      exitTicketQuestions: [
        "Vul in: 'De derde stand kwam in opstand, niet alleen omdat ze arm waren, maar ook omdat...' (Leg uit met een voorbeeld over belasting of inspraak).",
        "Stel jij was koning in 1788. Welke ene maatregel had jij genomen om de revolutie (misschien) te voorkomen? Onderbouw je keuze."
      ],
      teacherNotes: "Let goed op dat je niet te ver vooruit loopt naar de executie van de koning, houd het deze les enkel bij de oorzaken."
    });
    setActiveStep(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-4 md:my-8 px-4 animate-in fade-in duration-500">
      
      {/* Header section (Outside Card) */}
      <div className="flex flex-col mb-6 px-4 md:px-0">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100/80 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-200/50 backdrop-blur-sm shadow-sm">
            Start Intake
          </div>
          <button 
            type="button"
            onClick={fetchLibrary}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-200/50 transition-all active:scale-95 cursor-pointer backdrop-blur-sm shadow-sm"
          >
            <Library className="w-3 h-3" /> Kies uit Bibliotheek
          </button>
          <button 
            type="button"
            onClick={handleDemoLes}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 hover:bg-amber-200 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200/50 transition-all active:scale-95 cursor-pointer backdrop-blur-sm shadow-sm"
          >
            Snel invullen (Demo Les)
          </button>
          <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100/80 hover:bg-blue-200 text-blue-800 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-200/50 transition-all active:scale-95 cursor-pointer backdrop-blur-sm shadow-sm">
            <Plus className="w-3 h-3" /> Importeer (JSON)
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                  try {
                    const result = re.target?.result;
                    if (typeof result === 'string') {
                      const data = JSON.parse(result);
                      setPrep({
                        ...prep,
                        ...data
                      });
                      setActiveStep(1); // ga direct naar stap 2 om de inhoud te laten zien
                    }
                  } catch (err) {
                    alert('Bestand is geen geldige intake');
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Lesvoorbereiding</h2>
        <p className="text-slate-500 mt-1 font-medium text-sm max-w-2xl">Loop door deze korte stappen om je les inhoudelijk neer te zetten.</p>
      </div>

      {/* Main Card: Stepper / Split Layout */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/60 overflow-hidden flex flex-col md:flex-row min-h-[500px] relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-50/50 rounded-bl-full -mr-16 -mt-16 z-0 mix-blend-multiply opacity-50 pointer-events-none"></div>

        {/* Left Sidebar (Navigation) */}
        <div className={`transition-all duration-300 ease-in-out bg-slate-50/50 flex flex-col md:border-r border-b md:border-b-0 border-slate-100/60 shrink-0 relative z-10 backdrop-blur-sm ${
          isSidebarOpen ? 'w-full md:w-56 lg:w-64 p-5' : 'w-full md:w-20 lg:w-24 p-3'
        }`}>
          <div className="flex justify-between items-center mb-4 hidden md:flex">
             {isSidebarOpen && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2">Stappen</span>}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors mx-auto">
                <PanelLeftClose className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
             </button>
          </div>
          
          <div className="space-y-2 flex-grow overflow-x-auto md:overflow-visible flex md:flex-col pb-2 md:pb-0 hide-scrollbar">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  title={step.title}
                  className={`flex flex-row items-center gap-2.5 p-2.5 rounded-lg transition-all font-medium text-left mr-2 md:mr-0 min-w-max md:min-w-0 ${
                    isActive 
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50 translate-x-0 md:translate-x-1' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  } ${!isSidebarOpen && 'md:justify-center'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : step.isComplete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.isComplete && !isActive ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm font-semibold transition-all duration-300 md:block ${isSidebarOpen ? 'opacity-100 w-auto' : 'md:hidden opacity-0 w-0 overflow-hidden'}`}>{step.title}</span>
                </button>
              );
            })}
          </div>

          <div className={`hidden md:block mt-8 pt-8 border-t border-slate-200/50 transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
            <div className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-widest">Samenvatting</div>
            <div className="space-y-1 mb-6">
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{prep.title || 'Geen lesdoel'}</p>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">{prep.subject || 'Geen vak'} {prep.className ? `• ${prep.className}` : ''}</p>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-transparent relative z-10 w-full">
          
          <div className="flex-1 p-5 md:p-6 relative">
            {/* Step Content */}
            <div className="max-w-2xl animate-in slide-in-from-right-4 fade-in duration-300 fill-mode-forwards" key={activeStep}>
              
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-600 flex items-center justify-center">
                    {React.createElement(steps[activeStep].icon, { className: "w-4 h-4" })}
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 tracking-tight">{steps[activeStep].title}</h3>
              </div>

              {/* BASICS */}
              {activeStep === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="font-bold text-slate-800 text-sm tracking-wide">Lesdoel</label>
                      <input
                        className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                        placeholder="Bijv. Breuken gelijknamig maken"
                        value={prep.title}
                        onChange={(e) => setPrep({ ...prep, title: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-800 text-sm tracking-wide">Vak</label>
                      <input
                        className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                        placeholder="Bijv. Wiskunde"
                        value={prep.subject}
                        onChange={(e) => setPrep({ ...prep, subject: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-800 text-sm tracking-wide">Klas</label>
                      <input
                        className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                        placeholder="Bijv. 2B"
                        value={prep.className}
                        onChange={(e) => setPrep({ ...prep, className: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-800 text-sm tracking-wide">Leerjaar</label>
                      <input
                        className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                        placeholder="Bijv. 2"
                        value={prep.gradeYear}
                        onChange={(e) => setPrep({ ...prep, gradeYear: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-bold text-slate-800 text-sm tracking-wide">Niveau</label>
                      <input
                        className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                        placeholder="Bijv. HAVO"
                        value={prep.level}
                        onChange={(e) => setPrep({ ...prep, level: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 p-5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-full -mr-12 -mt-12 z-0 mix-blend-overlay"></div>
                    <div className="relative z-10">
                      <h4 className="text-indigo-900 font-bold text-base tracking-tight mb-1">Hulp nodig?</h4>
                      <p className="text-sm text-indigo-700/80 font-medium">Laat AI alle doelen, vragen en misconcepties invullen op basis van de ingevulde gegevens.</p>
                    </div>
                    <button
                      type="button"
                      onClick={generateWithAI}
                      disabled={isGenerating || !prep.subject || !prep.title}
                      className="relative z-10 w-full sm:w-auto shrink-0 group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 border border-indigo-200 hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : genSuccess ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Wand2 className="w-5 h-5 text-indigo-500" />
                      )}
                      {isGenerating ? "Aan het genereren..." : genSuccess ? "Ingevuld!" : "Aanvullen met AI"}
                    </button>
                  </div>
                </div>
              )}

              {/* DOELEN */}
              {activeStep === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-800 text-sm tracking-wide">Centraal Leerdoel</label>
                    <textarea
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-3 min-h-[80px] focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none resize-none transition-shadow placeholder:text-slate-400 font-medium overflow-hidden text-sm"
                      placeholder="Wat moeten leerlingen aan het eind van de les kennen of kunnen?"
                      value={prep.learningGoal}
                      onChange={(e) => {
                        setPrep({ ...prep, learningGoal: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      autoFocus
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
              {activeStep === 2 && (
                <div className="space-y-6">
                  <StringListField
                    label="Startvragen / Activeren Voorkennis"
                    placeholder="Typ een vraag om voorkennis te peilen..."
                    values={prep.priorKnowledgeQuestions}
                    onChange={(priorKnowledgeQuestions) =>
                      setPrep({ ...prep, priorKnowledgeQuestions })
                    }
                  />

                  <div className="h-px bg-slate-200" />

                  <StringListField
                    label="Activerende Instructie"
                    placeholder="Denkvraag of activiteit tijdens de presentatie..."
                    values={prep.instructionActivities}
                    onChange={(instructionActivities) =>
                      setPrep({ ...prep, instructionActivities })
                    }
                  />

                  <div className="h-px bg-slate-200" />

                  <StringListField
                    label="Formatieve Checkvragen"
                    placeholder="Typ een checkvraag tijdens de instructie..."
                    values={prep.checkQuestions}
                    onChange={(checkQuestions) => setPrep({ ...prep, checkQuestions })}
                  />

                  <div className="h-px bg-slate-200" />

                  <StringListField
                    label="Verwerkingstaken"
                    placeholder="Opdracht of taak tijdens de verwerking..."
                    values={prep.processingActivities}
                    onChange={(processingActivities) =>
                      setPrep({ ...prep, processingActivities })
                    }
                  />

                  <div className="h-px bg-slate-200" />

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
              {activeStep === 3 && (
                <div className="space-y-6">
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
              {activeStep === 4 && (
                <div className="space-y-4">
                  <label className="font-bold text-slate-800 text-sm tracking-wide">Persoonlijke Notities</label>
                  <textarea
                    ref={(el) => {
                      if (el) {
                        el.style.height = 'auto';
                        el.style.height = `${el.scrollHeight}px`;
                      }
                    }}
                    className="w-full rounded-lg border-2 border-slate-200/60 bg-slate-50/50 px-3 py-3 min-h-[120px] focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none resize-none transition-shadow placeholder:text-slate-400 font-medium overflow-hidden text-sm"
                    placeholder="Persoonlijke krabbels, pagina's uit het boek, of geheugensteuntjes voor tijdens de les..."
                    value={prep.teacherNotes}
                    onChange={(e) => {
                      setPrep({ ...prep, teacherNotes: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    autoFocus
                  />
                </div>
              )}

            </div>
          </div>

          <div className="border-t border-slate-200/60 p-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 bg-slate-50/50 backdrop-blur-sm relative z-10">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              {onCancel && activeStep === 0 && (
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors active:scale-95"
                  onClick={onCancel}
                >
                  Annuleren
                </button>
              )}
              {activeStep > 0 && (
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95 shadow-sm"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="w-4 h-4" /> Vorige
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                  onClick={handleNext}
                >
                  Volgende <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {onChoosePrint && (
                    <button
                      className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-6 py-3 border-2 border-indigo-200 text-indigo-700 bg-white rounded-xl font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
                      onClick={() => onChoosePrint(prep)}
                    >
                      <FileText className="w-5 h-5" />
                      Uitdraai (PDF)
                    </button>
                  )}
                  <button
                    className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                    onClick={() => onSave(prep)}
                  >
                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Digibord Les
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Library Modal Overlay */}
      {showLibrary && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-indigo-700">
                <Library className="w-5 h-5" />
                <h3 className="font-bold text-lg">Intake Bibliotheek</h3>
              </div>
              <button 
                onClick={() => setShowLibrary(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-slate-50/20">
              {libraryLoading ? (
                <div className="flex items-center justify-center p-6 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Bibliotheek laden...
                </div>
              ) : libraryTemplates.length === 0 ? (
                <div className="text-center p-6 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Nog geen lessen in de bibliotheek gevonden.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {libraryTemplates.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{t.title}</h4>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{t.subject}</span>
                          {t.grade_level && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{t.grade_level}</span>}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          try {
                            const data = JSON.parse(t.prep_json);
                            setPrep({ ...prep, ...data });
                            setShowLibrary(false);
                            setActiveStep(1);
                          } catch(err) {
                            alert('Fout bij het parsen van deze template');
                          }
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold rounded-lg transition-colors text-sm"
                      >
                        Gebruiken
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
