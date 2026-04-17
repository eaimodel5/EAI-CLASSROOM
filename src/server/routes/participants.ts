import { Router, Request, Response } from 'express';
import db from '../../db/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { broadcast } from '../websocket.ts';

export const participantsRouter = Router();

participantsRouter.post('/join', (req: Request, res: Response) => {
  const { session_code, display_name, device_type, participant_key } = req.body;
  
  try {
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE session_code = ? AND status = ?').get(session_code.toUpperCase(), 'ACTIVE') as any;
    if (!session) return res.status(404).json({ error: 'Sessie niet gevonden of niet actief' });
    if (session.is_locked) return res.status(403).json({ error: 'Sessie is vergrendeld door de docent' });

    let participant;

    if (participant_key) {
      // Try to find the existing participant by key AND session
      participant = db.prepare('SELECT * FROM classroom_participants WHERE classroom_session_id = ? AND participant_key = ?').get(session.id, participant_key) as any;
    }

    if (participant) {
      // Update existing participant (e.g., if they changed their name or reconnected)
      db.prepare(`
        UPDATE classroom_participants 
        SET display_name = ?, join_status = 'JOINED', device_type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(display_name, device_type, participant.id);
      
      participant = db.prepare('SELECT * FROM classroom_participants WHERE id = ?').get(participant.id);
    } else {
      // Create new participant
      const id = uuidv4();
      const new_participant_key = participant_key || `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`; 
      
      db.prepare(`
        INSERT INTO classroom_participants (id, classroom_session_id, display_name, participant_key, join_status, device_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, session.id, display_name, new_participant_key, 'JOINED', device_type);

      participant = db.prepare('SELECT * FROM classroom_participants WHERE id = ?').get(id);
    }
    
    broadcast({ type: 'PARTICIPANT_JOINED', session_id: session.id, participant });
    res.status(201).json({ session, participant });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});
