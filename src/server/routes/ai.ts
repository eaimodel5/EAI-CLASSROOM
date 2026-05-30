import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateAiContent } from '../services/ai.ts';
import { getSsotContextForPrompt } from '../../lib/ssot.ts';
import { Type } from '@google/genai';

import { generateTeacherProposal } from '../services/classroomAnalysis.ts';

export const aiRouter = Router({ mergeParams: true });

aiRouter.post('/proposal', async (req: Request, res: Response) => {
  try {
    const proposal = await generateTeacherProposal(req.body);
    res.json(proposal);
  } catch (error) {
    console.error('Error generating teacher proposal:', error);
    res.status(500).json({ error: 'Failed to generate teacher proposal' });
  }
});

// LEGACY ROUTE: Should be replaced by /proposal flow.
aiRouter.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { session, signals } = req.body;
    if (!session) return res.status(400).json({ error: 'Session data not provided' });

    if (!signals || signals.length === 0) {
      return res.json({ message: 'No signals to summarize' });
    }

    const signalsText = signals.map((s: any) => {
      let line = '- Participant ' + s.participant_id + ': ' + s.signal_type;
      if (s.text_value) {
        line += ' ("' + s.text_value + '")';
      }
      return line;
    }).join('\n');
    const ssotContext = getSsotContextForPrompt(session);
    
    const prompt = `
Je bent de EAI CLASSROOM Agent. Je helpt een docent tijdens de les door live signalen van leerlingen te clusteren EN direct een bijpassende didactische verwerkingsstap voor te stellen.
De huidige lesfase is: ${session.active_phase}.
Het lesdoel is: ${session.lesson_goal || 'Niet opgegeven'}.

${ssotContext}

Hier zijn de recente signalen van leerlingen:
${signalsText}

STAP 1: Bepaal de best passende didactische TAALwerkvorm (Emmauscollege) uit de volgende categorieën, rekening houdend met de fase en de soort signalen:
- Start / Voorkennis: Brain dump
- Instructie / Snel begrip checken: Wisbordjes
- Conceptvorming / Redeneren: Denken-delen-uitwisselen
- Verwerking / Fouten verbeteren: Peerfeedback, Gallery walk
- Na instructie / Relaties leggen: Conceptmap
- Discussie / Argumentatie: Stelling A/B
- Veilige bespreking van misconcepties: Fout antwoord analyseren
- Halverwege les (zelfinschatting): Stoplichtcheck
- Verdieping (nieuwe context): Transfer-vraag
- Korte diagnostiek over alle niveaus: Mini-quiz
- Moeilijke abstracte stof: Herformuleren
- Samenvatten: Samenvatten in 3 zinnen
- Afsluiting / Korte analyse: Exit ticket, Quick scan 3-2-1

STAP 2: Maak een bondige samenvatting voor de docent over deze signalen, en onderbouw WAAROM de gekozen TAALwerkvorm nu de beste stap is om de leerlingen met vaktaal of begrip verder te helpen.

Guardrails:
- Noem NOOIT namen van leerlingen (privacy-by-design). Gebruik percentages of aantallen.
- Oordeel niet (bijv. niet: "De klas snapt er niks van", maar: "30% van de signalen wijst op verwarring rond concept X").
- Gebruik GEEN emoji's of emoticons in de gegenereerde tekst.

Geef me UITSLUITEND een geldig JSON object terug (zonder markdown) met exact de volgende structuur:
{
  "headline": "Eén korte, actiegerichte zin (max 8 woorden)",
  "body": "Korte toelichting of clustering van signalen (max 2 zinnen).",
  "confidence_label": "HIGH" of "MEDIUM" of "LOW",
  "suggested_activity": "Naam van de gekozen TAALwerkvorm",
  "activity_rationale": "Korte onderbouwing (1-2 zinnen) waarom de gekozen TAALwerkvorm nu perfect is om de leerlingen verder te helpen."
}
`;

    const resultText = await generateAiContent(prompt, true);
    const result = JSON.parse(resultText);

    const summaryId = uuidv4();
    const summary = {
      id: summaryId,
      classroom_session_id: session.id,
      phase: session.active_phase,
      summary_type: 'PHASE_BRIEFING',
      headline: result.headline || 'Samenvatting',
      body: result.body || '',
      evidence_count: signals.length,
      confidence_label: result.confidence_label || 'MEDIUM',
      summary_json: JSON.stringify(result),
      generator_type: 'GEMINI_FLASH',
      created_at: new Date().toISOString()
    };

    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

aiRouter.post('/differentiation', async (req: Request, res: Response) => {
  try {
    const { session, participants, signals } = req.body;
    if (!session) return res.status(400).json({ error: 'Session not provided' });

    const ssotContext = getSsotContextForPrompt(session, '/diff');
    
    const participantsList = (participants || []).map((p: any) => `- ${p.display_name} (ID: ${p.id})`).join('\n');
    const signalsList = (signals || []).map((s: any) => `- ${s.display_name || s.participant_id} (ID: ${s.participant_id}): ${s.signal_type} ${s.text_value ? `("${s.text_value}")` : ''}`).join('\n');

    const prompt = `
Je bent de EAI CLASSROOM Agent gebonden aan de didactiek van SSOT 16.2.
De huidige lesfase is: ${session.active_phase}.
Het lesdoel is: ${session.lesson_goal || 'Niet opgegeven'}.

${ssotContext}

Je doel is om de actieve deelnemers in de klas in 2 groepen te verdelen op basis van hun signalen:
1. "Verlengde Instructie" (Leerlingen die moeite lijken te hebben en direct hulp van de docent nodig hebben op de instructietafel).
2. "Verdiepingsopdracht" (Leerlingen die de stof waarschijnlijk beheersen en zelfstandig verder mogen).

AANWEZIGE LEERLINGEN:
${participantsList || 'Geen actieve deelnemers'}

UITGEZONDEN SIGNALEN IN DEZE FASE:
${signalsList || 'Geen recente signalen'}

Regels:
- Als een leerling aangeeft vast te lopen (bijv. signal_type = 'STUCK' of veel moeilijke woorden vraagt), plaats deze in Verlengde Instructie.
- Leerlingen zonder (negatieve) signalen mogen naar Verdieping.
- Pas de /diff regels toe: wees objectief.

Geef me UITSLUITEND een geldig JSON object terug met de volgende structuur:
{
  "extendedInstruction": ["ID_LEERLING_1", "ID_LEERLING_2"],
  "enrichment": ["ID_LEERLING_3", "ID_LEERLING_4"],
  "rationale": "Korte uitleg waarom deze tweedeling is gemaakt o.b.v. de data (max 2 zinnen)."
}
`;

    const resultText = await generateAiContent(prompt, true);
    const result = JSON.parse(resultText);

    res.json(result);
  } catch (error) {
    console.error('Error generating differentiation:', error);
    res.status(500).json({ error: 'Failed to generate differentiation' });
  }
});

aiRouter.post('/word', async (req: Request, res: Response) => {
  const { id: sessionId } = req.params;
  const { participant_id, word, phase, session } = req.body;
  const id = uuidv4();

  try {
    const ssotContext = session ? getSsotContextForPrompt(session, '/vocab') : '';

    const prompt = `Geef een korte, kindvriendelijke en duidelijke betekenis voor het Nederlandse woord "${word}". Maximaal 2 zinnen.
${ssotContext}
Gebruik GEEN emoji's of emoticons. Houd de toon professioneel en zakelijk. Zorg dat de uitleg past bij de context van de les.`;
    
    let definition = 'Geen betekenis gevonden.';
    try {
      definition = await generateAiContent(prompt);
      definition = definition.trim();
    } catch (err) {
      console.warn('AI failed to define word, using fallback.');
    }

    const payload_json = JSON.stringify({ definition });

    res.status(201).json({ id, participant_id, phase, signal_type: 'WORD', text_value: word, payload_json });
  } catch (error) {
    console.error('Error processing difficult word:', error);
    res.status(500).json({ error: 'Failed to process difficult word' });
  }
});

aiRouter.post('/explain', async (req: Request, res: Response) => {
  try {
    const { topic, session } = req.body;
    if (!session) return res.status(400).json({ error: 'Session not provided' });
    
    const targetTopic = topic || session.lesson_goal || 'het huidige lesonderwerp';
    const ssotContext = getSsotContextForPrompt(session, '/beeld');

    const prompt = `
Je bent de EAI CLASSROOM Agent.
De huidige lesfase is: ${session.active_phase}.

${ssotContext}

Punt van verwarring / te begrijpen concept: "${targetTopic}"

Genereer een didactisch ijzersterke metafoor of abstractie-verlaging voor dit knelpunt gericht op de belevingswereld van de leerling.

Regels:
- Houd het beknopt (max 3 korte alinea's).
- Gebruik taal passend bij de doelgroep van de les.
- Beantwoord UITSLUITEND met een geldig JSON object met de volgende structuur:
{
  "title": "Korte pakkende titel (max 5 woorden)",
  "explanation": "De volledige uitleg in 2-3 toegankelijke zinnen",
  "checkQuestion": "Korte controlevraag om te zien of ze het nu snappen"
}
`;
    const resultText = await generateAiContent(prompt, true);
    const result = JSON.parse(resultText);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

aiRouter.post('/feedforward', async (req: Request, res: Response) => {
  try {
    const { session, participants, signals } = req.body;
    if (!session) return res.status(400).json({ error: 'Session not provided' });

    const ssotContext = getSsotContextForPrompt(session);
    
    const participantsList = (participants || []).map((p: any) => `- ${p.display_name} (ID: ${p.id})`).join('\n');
    const signalsList = (signals || []).map((s: any) => {
      const textVal = s.text_value ? `("${s.text_value}")` : '';
      return `- [Fase: ${s.phase}] ${s.display_name || s.participant_id} (ID: ${s.participant_id}): ${s.signal_type} ${textVal}`;
    }).join('\n');

    const prompt = `
Je bent de EAI CLASSROOM Agent gebonden aan de didactiek van SSOT 16.2.
De lesfase was: ${session.active_phase} (we maken een feedforward/lessons-learned aan het einde van de sessie).
Het lesdoel was: ${session.lesson_goal || 'Niet opgegeven'}.

${ssotContext}

Jouw doel is om een macro-feedforward (les voorbereiding voor de VOLGENDE les) te schrijven voor de docent op basis van alle signalen van de leerlingen tijdens deze les. Dit sluit perfect aan op het SSOT 16.2 principe van formatief handelen.

AANWEZIGE LEERLINGEN:
${participantsList || 'Geen actieve deelnemers'}

UITGEZONDEN SIGNALEN IN DE HELE LES:
${signalsList || 'Geen signalen'}

Regels:
- Stel een korte, krachtige samenvattende start voor de volgende les op (wat moet herhaald worden o.b.v. struikelblokken?).
- Selecteer leerlingen die specifieke check-in of verlengde instructie nodig hebben.
- Geef een suggestie voor het leerdoel of de volgende stap voor de volgende les.
- Houd je aan de rubrics van SSOT 16.2, formatief handelen is leidend.
- Beantwoord UITSLUITEND met een geldig JSON object met de volgende structuur:
{
  "recapStart": "Concreet advies over hoe de docent de volgende les moet starten (2-3 zinnen).",
  "checkInStudentNames": ["Naam Leerling 1", "Naam Leerling 2"],
  "nextGoalSuggestion": "Een logisch formatief vervolgdoel voor de volgende les.",
  "rationale": "Korte uitleg waarom dit advies gegeven wordt o.b.v. de signalen van de afgelopen les."
}
`;
    const resultText = await generateAiContent(prompt, true);
    const result = JSON.parse(resultText);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating feedforward:', error);
    res.status(500).json({ error: 'Failed to generate feedforward' });
  }
});

aiRouter.post('/generate-prep', async (req: Request, res: Response) => {
  try {
    const { title, subject, className, gradeYear, level, learningGoal } = req.body;
    
    const prompt = `Je bent een vakdidactisch expert en ervaren docent met een focus op actieve didactiek. 
Maak een uitgebreide en rijke lesvoorbereiding op basis van de volgende gegevens:
Lesdoel / Onderwerp: ${title}
Vak: ${subject}
Klas: ${className || 'Niet gespecificeerd'}
Leerjaar: ${gradeYear || 'Niet gespecificeerd'}
Niveau: ${level || 'Niet gespecificeerd'}
Leerdoel: ${learningGoal || 'Bedenk een passend en concreet leerdoel op basis van de titel en het vak.'}

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
- Focus op formatief handelen en de actieve betrokkenheid van de leerling bij het lesdoel.`;

    const schema = {
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
      required: [
        "learningGoal", 
        "successCriteria", 
        "priorKnowledgeQuestions", 
        "instructionActivities", 
        "checkQuestions", 
        "processingActivities", 
        "misconceptions", 
        "interventions", 
        "exitTicketQuestions", 
        "teacherNotes"
      ]
    };

    const resultText = await generateAiContent(prompt, true, schema);
    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error) {
    console.error('Error generating lesson preparation with AI:', error);
    res.status(500).json({ error: 'Failed to generate lesson preparation with AI' });
  }
});
