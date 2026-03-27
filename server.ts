import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import db from './src/db/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { getSsotContextForPrompt } from './src/lib/ssot.ts';

function generateSessionCode() {
  // Generate a 6-character uppercase alphanumeric code, avoiding ambiguous characters like O/0, I/1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = process.env.NODE_ENV === 'production' ? parseInt(process.env.PORT || '3000', 10) : 3000;

  app.use(express.json());

  // API Routes (Blok 1: Sessiekern)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EAI CLASSROOM API is running' });
  });

  // POST /api/sessions - Start a new session
  app.post('/api/sessions', (req, res) => {
    const { teacher_user_id, subject, grade, level, lesson_goal } = req.body;
    const id = uuidv4();
    const session_code = generateSessionCode();
    const active_phase = 'START';
    const status = 'ACTIVE';
    const started_at = new Date().toISOString();

    try {
      const stmt = db.prepare(`
        INSERT INTO classroom_sessions (id, teacher_user_id, session_code, subject, grade, level, lesson_goal, active_phase, status, started_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, teacher_user_id || 'teacher-1', session_code, subject, grade, level, lesson_goal, active_phase, status, started_at);

      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // GET /api/sessions/:id - Get session details
  app.get('/api/sessions/:id', (req, res) => {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  });

  // GET /api/sessions/:id/participants - Get session participants
  app.get('/api/sessions/:id/participants', (req, res) => {
    try {
      const participants = db.prepare('SELECT * FROM classroom_participants WHERE classroom_session_id = ? ORDER BY joined_at DESC').all(req.params.id);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  });

  // GET /api/sessions/:id/signals - Get session signals
  app.get('/api/sessions/:id/signals', (req, res) => {
    try {
      const signals = db.prepare('SELECT * FROM classroom_signals WHERE classroom_session_id = ? ORDER BY created_at DESC').all(req.params.id);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch signals' });
    }
  });

  // GET /api/sessions/:id/summaries - Get session summaries
  app.get('/api/sessions/:id/summaries', (req, res) => {
    try {
      const summaries = db.prepare('SELECT * FROM classroom_summaries WHERE classroom_session_id = ? ORDER BY generated_at DESC').all(req.params.id);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch summaries' });
    }
  });

  // POST /api/sessions/:id/summarize - Generate AI summary for current phase
  app.post('/api/sessions/:id/summarize', async (req, res) => {
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

      // Prepare prompt for Gemini
      const signalsText = signals.map(s => `- ${s.display_name}: ${s.signal_type} ${s.text_value ? `("${s.text_value}")` : ''}`).join('\n');
      const ssotContext = getSsotContextForPrompt(session.active_phase);
      
      const prompt = `
Je bent de EAI CLASSROOM Agent. Je helpt een docent tijdens de les door live signalen van leerlingen te clusteren.
De huidige lesfase is: ${session.active_phase}.
Het lesdoel is: ${session.lesson_goal || 'Niet opgegeven'}.

${ssotContext}

Hier zijn de recente signalen van leerlingen:
${signalsText}

Maak een zeer korte, bondige samenvatting voor de docent.
Geef me een JSON object terug met de volgende structuur:
{
  "headline": "Eén korte, actiegerichte zin (max 8 woorden)",
  "body": "Een korte toelichting of clustering van de signalen (max 2 zinnen). Koppel dit indien mogelijk aan de didactische context.",
  "confidence_label": "HIGH" of "MEDIUM" of "LOW"
}
Zorg dat de output uitsluitend geldige JSON is, zonder markdown formatting.
`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const resultText = response.text || '{}';
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

      // Broadcast summary to teacher
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SUMMARY_GENERATED', session_id: session.id, summary }));
        }
      });

      res.json(summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      res.status(500).json({ error: 'Failed to generate summary' });
    }
  });

  // GET /api/sessions/code/:code - Get session by code (for board and student join)
  app.get('/api/sessions/code/:code', (req, res) => {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE session_code = ? AND status = ?').get(req.params.code.toUpperCase(), 'ACTIVE');
    if (!session) return res.status(404).json({ error: 'Sessie niet gevonden of niet actief' });
    res.json(session);
  });
  
  // PUT /api/sessions/:id/phase - Update session phase
  app.put('/api/sessions/:id/phase', (req, res) => {
    const { active_phase } = req.body;
    try {
      db.prepare('UPDATE classroom_sessions SET active_phase = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(active_phase, req.params.id);
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
      
      // Broadcast phase change to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'PHASE_CHANGED', session_id: req.params.id, active_phase }));
        }
      });
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update phase' });
    }
  });

  // PUT /api/sessions/:id/end - End session
  app.put('/api/sessions/:id/end', (req, res) => {
    try {
      db.prepare('UPDATE classroom_sessions SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('ENDED', req.params.id);
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
      
      // Broadcast session end
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SESSION_ENDED', session_id: req.params.id }));
        }
      });
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to end session' });
    }
  });

  // POST /api/participants/join - Student joins a session
  app.post('/api/participants/join', (req, res) => {
    const { session_code, display_name, device_type } = req.body;
    
    try {
      // 1. Find active session
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE session_code = ? AND status = ?').get(session_code.toUpperCase(), 'ACTIVE') as any;
      if (!session) return res.status(404).json({ error: 'Sessie niet gevonden of niet actief' });

      // 2. Create or update participant
      const id = uuidv4();
      const participant_key = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`; // Simple anon key for MVP
      
      const stmt = db.prepare(`
        INSERT INTO classroom_participants (id, classroom_session_id, display_name, participant_key, join_status, device_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, session.id, display_name, participant_key, 'JOINED', device_type);

      const participant = db.prepare('SELECT * FROM classroom_participants WHERE id = ?').get(id);
      
      // 3. Broadcast join event to teacher
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'PARTICIPANT_JOINED', session_id: session.id, participant }));
        }
      });

      res.status(201).json({ session, participant });
    } catch (error) {
      console.error('Error joining session:', error);
      res.status(500).json({ error: 'Failed to join session' });
    }
  });

  // POST /api/signals - Student sends a signal
  app.post('/api/signals', (req, res) => {
    const { classroom_session_id, participant_id, phase, signal_type, urgency, text_value } = req.body;
    const id = uuidv4();

    try {
      const stmt = db.prepare(`
        INSERT INTO classroom_signals (id, classroom_session_id, participant_id, phase, signal_type, urgency, status, text_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, classroom_session_id, participant_id, phase, signal_type, urgency || 'LOW', 'NEW', text_value || null);

      const signal = db.prepare('SELECT * FROM classroom_signals WHERE id = ?').get(id);
      
      // Broadcast signal to teacher
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SIGNAL_RECEIVED', session_id: classroom_session_id, signal }));
        }
      });

      res.status(201).json(signal);
    } catch (error) {
      console.error('Error sending signal:', error);
      res.status(500).json({ error: 'Failed to send signal' });
    }
  });

  // WebSocket Realtime Sync (vervangt Supabase realtime voor deze MVP)
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Simple broadcast for MVP realtime sync
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === 1) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (e) {
        console.error('WS message error', e);
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
