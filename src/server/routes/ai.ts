import { Router, Request, Response } from 'express';
import db from '../../db/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { broadcast } from '../websocket.ts';
import { generateAiContent } from '../services/ai.ts';
import { getSsotContextForPrompt } from '../../lib/ssot.ts';

export const aiRouter = Router({ mergeParams: true });

aiRouter.post('/summarize', async (req: Request, res: Response) => {
  try {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const signals = db.prepare(`
      SELECT s.*, p.display_name 
      FROM classroom_signals s
      JOIN classroom_participants p ON s.participant_id = p.id
      WHERE s.classroom_session_id = ? AND s.phase = ?
    `).all(session.id, session.active_phase) as any[];

    if (signals.length === 0) {
      return res.json({ message: 'No signals to summarize' });
    }

    const signalsText = signals.map(s => {
      let line = '- ' + s.display_name + ': ' + s.signal_type;
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
    const stmt = db.prepare(`
      INSERT INTO classroom_summaries (id, classroom_session_id, phase, summary_type, headline, body, evidence_count, confidence_label, summary_json, generator_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      summaryId, 
      session.id, 
      session.active_phase, 
      'PHASE_BRIEFING', 
      result.headline || 'Samenvatting', 
      result.body || '', 
      signals.length, 
      result.confidence_label || 'MEDIUM', 
      JSON.stringify(result),
      'GEMINI_FLASH'
    );

    const summary = db.prepare('SELECT * FROM classroom_summaries WHERE id = ?').get(summaryId);

    broadcast({ type: 'SUMMARY_GENERATED', session_id: session.id, summary });
    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

aiRouter.post('/differentiation', async (req: Request, res: Response) => {
  try {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const participants = db.prepare('SELECT id, display_name FROM classroom_participants WHERE classroom_session_id = ? AND status = "ACTIVE"').all(session.id) as any[];
    const signals = db.prepare(`
      SELECT s.participant_id, p.display_name, s.signal_type, s.text_value
      FROM classroom_signals s
      JOIN classroom_participants p ON s.participant_id = p.id
      WHERE s.classroom_session_id = ? AND s.phase = ?
    `).all(session.id, session.active_phase) as any[];

    const ssotContext = getSsotContextForPrompt(session, '/diff');
    
    const participantsList = participants.map(p => `- ${p.display_name} (ID: ${p.id})`).join('\n');
    const signalsList = signals.map(s => `- ${s.display_name} (ID: ${s.participant_id}): ${s.signal_type} ${s.text_value ? `("${s.text_value}")` : ''}`).join('\n');

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
  const { participant_id, word, phase } = req.body;
  const id = uuidv4();

  try {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(sessionId) as any;
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

    const stmt = db.prepare(`
      INSERT INTO classroom_signals (id, classroom_session_id, participant_id, phase, signal_type, urgency, status, text_value, payload_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, sessionId, participant_id, phase, 'WORD', 'LOW', 'NEW', word, payload_json);

    const signal = db.prepare('SELECT * FROM classroom_signals WHERE id = ?').get(id);
    
    broadcast({ type: 'SIGNAL_RECEIVED', session_id: sessionId, signal });
    res.status(201).json(signal);
  } catch (error) {
    console.error('Error processing difficult word:', error);
    res.status(500).json({ error: 'Failed to process difficult word' });
  }
});

aiRouter.post('/explain', async (req: Request, res: Response) => {
  try {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const { topic } = req.body;
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
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const participants = db.prepare('SELECT id, display_name FROM classroom_participants WHERE classroom_session_id = ? AND status = "ACTIVE"').all(session.id) as any[];
    const signals = db.prepare(`
      SELECT s.participant_id, p.display_name, s.signal_type, s.text_value, s.phase
      FROM classroom_signals s
      JOIN classroom_participants p ON s.participant_id = p.id
      WHERE s.classroom_session_id = ?
    `).all(session.id) as any[];

    const ssotContext = getSsotContextForPrompt(session);
    
    const participantsList = participants.map(p => `- ${p.display_name} (ID: ${p.id})`).join('\n');
    const signalsList = signals.map(s => {
      const textVal = s.text_value ? `("${s.text_value}")` : '';
      return `- [Fase: ${s.phase}] ${s.display_name} (ID: ${s.participant_id}): ${s.signal_type} ${textVal}`;
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
