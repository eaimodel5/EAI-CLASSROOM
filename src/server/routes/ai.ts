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
Je bent de EAI CLASSROOM Agent. Je helpt een docent tijdens de les door live signalen van leerlingen te clusteren.
De huidige lesfase is: ${session.active_phase}.
Het lesdoel is: ${session.lesson_goal || 'Niet opgegeven'}.

${ssotContext}

Hier zijn de recente signalen van leerlingen:
${signalsText}

Guardrails:
- Noem NOOIT namen van leerlingen (privacy-by-design). Gebruik percentages of aantallen.
- Oordeel niet (bijv. niet: "De klas snapt er niks van", maar: "30% van de signalen wijst op verwarring rond concept X").
- Wees handelingsgericht: sluit altijd af met een suggestie voor de docent.
- Gebruik GEEN emoji's of emoticons in de gegenereerde tekst. Houd de toon professioneel en zakelijk.

Maak een zeer korte, bondige samenvatting voor de docent.
Geef me een JSON object terug met de volgende structuur:
{
  "headline": "Eén korte, actiegerichte zin (max 8 woorden)",
  "body": "Een korte toelichting of clustering van de signalen (max 2 zinnen). Koppel dit indien mogelijk aan de didactische context en sluit af met een suggestie.",
  "confidence_label": "HIGH" of "MEDIUM" of "LOW"
}
Zorg dat de output uitsluitend geldige JSON is, zonder markdown formatting.
`;

    const resultText = await generateAiContent(prompt, true);
    const result = JSON.parse(resultText);

    const summaryId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO classroom_summaries (id, classroom_session_id, phase, summary_type, headline, body, evidence_count, confidence_label, generator_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

aiRouter.post('/difficult-words', async (req: Request, res: Response) => {
  const { id: sessionId } = req.params;
  const { participant_id, word, phase } = req.body;
  const id = uuidv4();

  try {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(sessionId) as any;
    const ssotContext = session ? getSsotContextForPrompt(session) : '';

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
