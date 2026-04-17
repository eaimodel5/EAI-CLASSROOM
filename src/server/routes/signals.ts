import { Router, Request, Response } from 'express';
import db from '../../db/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { broadcast } from '../websocket.ts';

export const signalsRouter = Router();

signalsRouter.post('/', (req: Request, res: Response) => {
  const { classroom_session_id, participant_id, phase, signal_type, urgency, text_value, prompt_id } = req.body;
  const id = uuidv4();

  try {
    const stmt = db.prepare(`
      INSERT INTO classroom_signals (id, classroom_session_id, participant_id, phase, signal_type, urgency, status, text_value, prompt_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, classroom_session_id, participant_id, phase, signal_type, urgency || 'LOW', 'NEW', text_value || null, prompt_id || null);

    const signal = db.prepare('SELECT * FROM classroom_signals WHERE id = ?').get(id);
    
    broadcast({ type: 'SIGNAL_RECEIVED', session_id: classroom_session_id, signal });
    res.status(201).json(signal);
  } catch (error) {
    console.error('Error sending signal:', error);
    res.status(500).json({ error: 'Failed to send signal' });
  }
});
