import express from 'express';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import db from './src/db/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { getSsotContextForPrompt } from './src/lib/ssot.ts';
import dotenv from 'dotenv';

dotenv.config();

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
  const wss = new WebSocketServer({ server, path: '/ws' });
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

  // DELETE /api/sessions/:id/participants/:participantId - Remove a participant
  app.delete('/api/sessions/:id/participants/:participantId', (req, res) => {
    try {
      const { id, participantId } = req.params;
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
      if (!session) return res.status(404).json({ error: 'Session not found' });

      db.prepare('DELETE FROM classroom_participants WHERE id = ? AND classroom_session_id = ?').run(participantId, id);
      
      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'PARTICIPANT_REMOVED', session_id: id, participant_id: participantId }));
        }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing participant:', error);
      res.status(500).json({ error: 'Failed to remove participant' });
    }
  });

  // PUT /api/sessions/:id/lock - Toggle session lock
  app.put('/api/sessions/:id/lock', (req, res) => {
    try {
      const { id } = req.params;
      const { is_locked } = req.body;
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
      if (!session) return res.status(404).json({ error: 'Session not found' });

      db.prepare('UPDATE classroom_sessions SET is_locked = ? WHERE id = ?').run(is_locked ? 1 : 0, id);
      const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SESSION_UPDATED', session: updatedSession }));
        }
      });

      res.json(updatedSession);
    } catch (error) {
      console.error('Error locking session:', error);
      res.status(500).json({ error: 'Failed to lock session' });
    }
  });

  // PUT /api/sessions/:id/widgets - Update board widgets
  app.put('/api/sessions/:id/widgets', (req, res) => {
    try {
      const { id } = req.params;
      const { widgets_json } = req.body;
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
      if (!session) return res.status(404).json({ error: 'Session not found' });

      db.prepare('UPDATE classroom_sessions SET widgets_json = ? WHERE id = ?').run(widgets_json, id);
      const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SESSION_UPDATED', session: updatedSession }));
        }
      });

      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating widgets:', error);
      res.status(500).json({ error: 'Failed to update widgets' });
    }
  });

  // PUT /api/sessions/:id/timer - Set session timer
  app.put('/api/sessions/:id/timer', (req, res) => {
    try {
      const { id } = req.params;
      const { duration_seconds } = req.body; // if null, clears timer
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
      if (!session) return res.status(404).json({ error: 'Session not found' });

      if (duration_seconds === null) {
        db.prepare('UPDATE classroom_sessions SET timer_started_at = NULL, timer_duration_seconds = NULL WHERE id = ?').run(id);
      } else {
        db.prepare('UPDATE classroom_sessions SET timer_started_at = CURRENT_TIMESTAMP, timer_duration_seconds = ? WHERE id = ?').run(duration_seconds, id);
      }
      
      const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SESSION_UPDATED', session: updatedSession }));
        }
      });

      res.json(updatedSession);
    } catch (error) {
      console.error('Error setting timer:', error);
      res.status(500).json({ error: 'Failed to set timer' });
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

  // GET /api/sessions/:id/prompts - Get all session prompts
  app.get('/api/sessions/:id/prompts', (req, res) => {
    try {
      const prompts = db.prepare('SELECT * FROM classroom_prompts WHERE classroom_session_id = ? ORDER BY created_at DESC').all(req.params.id);
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prompts' });
    }
  });

  // GET /api/sessions/:id/prompts/:promptId - Get prompt details
  app.get('/api/sessions/:id/prompts/:promptId', (req, res) => {
    try {
      const prompt = db.prepare('SELECT * FROM classroom_prompts WHERE id = ?').get(req.params.promptId);
      if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prompt' });
    }
  });

  // POST /api/sessions/:id/prompts - Create a new prompt (checkvraag)
  app.post('/api/sessions/:id/prompts', (req, res) => {
    try {
      const { title, prompt_text, prompt_type, response_mode } = req.body;
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id) as any;
      if (!session) return res.status(404).json({ error: 'Session not found' });

      const promptId = uuidv4();
      const stmt = db.prepare(`
        INSERT INTO classroom_prompts (id, classroom_session_id, created_by_user_id, phase, prompt_type, title, prompt_text, response_mode, status, opened_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', CURRENT_TIMESTAMP)
      `);
      stmt.run(promptId, session.id, session.teacher_user_id, session.active_phase, prompt_type || 'OPEN_ENDED', title, prompt_text, response_mode || 'TEXT');

      // Set active prompt on session
      db.prepare('UPDATE classroom_sessions SET active_prompt_id = ? WHERE id = ?').run(promptId, session.id);
      const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(session.id);

      const prompt = db.prepare('SELECT * FROM classroom_prompts WHERE id = ?').get(promptId);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'PROMPT_CREATED', session_id: session.id, prompt, session: updatedSession }));
        }
      });

      res.status(201).json(prompt);
    } catch (error) {
      console.error('Error creating prompt:', error);
      res.status(500).json({ error: 'Failed to create prompt' });
    }
  });

  // POST /api/sessions/:id/prompts/:promptId/close - Close a prompt
  app.post('/api/sessions/:id/prompts/:promptId/close', (req, res) => {
    try {
      const { id, promptId } = req.params;
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
      if (!session) return res.status(404).json({ error: 'Session not found' });

      db.prepare('UPDATE classroom_prompts SET status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?').run('CLOSED', promptId);
      db.prepare('UPDATE classroom_sessions SET active_prompt_id = NULL WHERE id = ?').run(session.id);
      
      const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(session.id);
      const prompt = db.prepare('SELECT * FROM classroom_prompts WHERE id = ?').get(promptId);

      // Broadcast to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'PROMPT_CLOSED', session_id: session.id, prompt, session: updatedSession }));
        }
      });

      res.json(prompt);
    } catch (error) {
      console.error('Error closing prompt:', error);
      res.status(500).json({ error: 'Failed to close prompt' });
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
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

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

Maak een zeer korte, bondige samenvatting voor de docent.
Geef me een JSON object terug met de volgende structuur:
{
  "headline": "Eén korte, actiegerichte zin (max 8 woorden)",
  "body": "Een korte toelichting of clustering van de signalen (max 2 zinnen). Koppel dit indien mogelijk aan de didactische context en sluit af met een suggestie.",
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

  // PUT /api/sessions/:id/share-signal - Share a signal to the board
  app.put('/api/sessions/:id/share-signal', (req, res) => {
    const { shared_signal_id } = req.body;
    try {
      db.prepare('UPDATE classroom_sessions SET shared_signal_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(shared_signal_id, req.params.id);
      const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
      
      // Broadcast update to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SESSION_UPDATED', session }));
        }
      });
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to share signal' });
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
      if (session.is_locked) return res.status(403).json({ error: 'Sessie is vergrendeld door de docent' });

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
    const { classroom_session_id, participant_id, phase, signal_type, urgency, text_value, prompt_id } = req.body;
    const id = uuidv4();

    try {
      const stmt = db.prepare(`
        INSERT INTO classroom_signals (id, classroom_session_id, participant_id, phase, signal_type, urgency, status, text_value, prompt_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, classroom_session_id, participant_id, phase, signal_type, urgency || 'LOW', 'NEW', text_value || null, prompt_id || null);

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

  // POST /api/sessions/:id/difficult-words - Student submits a difficult word
  app.post('/api/sessions/:id/difficult-words', async (req, res) => {
    const { id: sessionId } = req.params;
    const { participant_id, word, phase } = req.body;
    const id = uuidv4();

    try {
      // Get definition from LLM
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Geef een korte, kindvriendelijke en duidelijke betekenis voor het Nederlandse woord "${word}". Maximaal 2 zinnen.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const definition = response.text?.trim() || 'Geen betekenis gevonden.';
      const payload_json = JSON.stringify({ definition });

      const stmt = db.prepare(`
        INSERT INTO classroom_signals (id, classroom_session_id, participant_id, phase, signal_type, urgency, status, text_value, payload_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, sessionId, participant_id, phase, 'WORD', 'LOW', 'NEW', word, payload_json);

      const signal = db.prepare('SELECT * FROM classroom_signals WHERE id = ?').get(id);
      
      // Broadcast signal to teacher
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'SIGNAL_RECEIVED', session_id: sessionId, signal }));
        }
      });

      res.status(201).json(signal);
    } catch (error) {
      console.error('Error processing difficult word:', error);
      res.status(500).json({ error: 'Failed to process difficult word' });
    }
  });

  // --- ADMIN ROUTES ---
  app.get('/api/admin/settings', (req, res) => {
    try {
      const settings = db.prepare('SELECT * FROM admin_settings').all();
      const settingsMap = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      res.json(settingsMap);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put('/api/admin/settings', (req, res) => {
    try {
      const settings = req.body;
      const updateStmt = db.prepare('INSERT INTO admin_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      
      db.transaction(() => {
        for (const [key, value] of Object.entries(settings)) {
          updateStmt.run(key, String(value));
        }
      })();
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.get('/api/admin/sessions', (req, res) => {
    try {
      const sessions = db.prepare(`
        SELECT 
          s.*,
          (SELECT COUNT(*) FROM classroom_participants p WHERE p.classroom_session_id = s.id) as participant_count,
          (SELECT COUNT(*) FROM classroom_signals sig WHERE sig.classroom_session_id = s.id) as signal_count
        FROM classroom_sessions s
        ORDER BY s.created_at DESC
      `).all();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });
  // --- END ADMIN ROUTES ---

  // WebSocket Realtime Sync (vervangt Supabase realtime voor deze MVP)
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.socket.remoteAddress, 'path:', req.url);
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WS message received:', data.type);
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

    ws.on('close', () => {
      console.log('WebSocket connection closed');
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
