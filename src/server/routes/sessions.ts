import { Router, Request, Response } from 'express';
import db from '../../db/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { broadcast } from '../websocket.ts';

function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const sessionsRouter = Router();

sessionsRouter.post('/', (req: Request, res: Response) => {
  const { teacher_user_id, subject, grade, level, lesson_goal, prep_json } = req.body;
  const id = uuidv4();
  const session_code = generateSessionCode();
  const active_phase = 'START';
  const status = 'ACTIVE';
  const started_at = new Date().toISOString();

  try {
    const stmt = db.prepare(`
      INSERT INTO classroom_sessions (id, teacher_user_id, session_code, subject, grade, level, lesson_goal, active_phase, status, started_at, prep_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, teacher_user_id || 'teacher-1', session_code, subject, grade, level, lesson_goal, active_phase, status, started_at, prep_json || null);

    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

sessionsRouter.get('/:id', (req: Request, res: Response) => {
  const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

sessionsRouter.get('/code/:code', (req: Request, res: Response) => {
  const session = db.prepare('SELECT * FROM classroom_sessions WHERE session_code = ? AND status = ?').get(req.params.code.toUpperCase(), 'ACTIVE');
  if (!session) return res.status(404).json({ error: 'Sessie niet gevonden of niet actief' });
  res.json(session);
});

sessionsRouter.get('/:id/participants', (req: Request, res: Response) => {
  try {
    const participants = db.prepare('SELECT * FROM classroom_participants WHERE classroom_session_id = ? ORDER BY joined_at DESC').all(req.params.id);
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

sessionsRouter.delete('/:id/participants/:participantId', (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    db.prepare('DELETE FROM classroom_participants WHERE id = ? AND classroom_session_id = ?').run(participantId, id);
    
    broadcast({ type: 'PARTICIPANT_REMOVED', session_id: id, participant_id: participantId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ error: 'Failed to remove participant' });
  }
});

sessionsRouter.put('/:id/participants/:participantId', (req: Request, res: Response) => {
  try {
    const { id, participantId } = req.params;
    const { display_name, timeout_until, can_draw, team_name } = req.body;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    let updateQuery = 'UPDATE classroom_participants SET updated_at = CURRENT_TIMESTAMP';
    const params: any[] = [];

    if (display_name !== undefined) {
      updateQuery += ', display_name = ?';
      params.push(display_name);
    }
    if (timeout_until !== undefined) {
      updateQuery += ', timeout_until = ?';
      params.push(timeout_until);
    }
    if (can_draw !== undefined) {
      updateQuery += ', can_draw = ?';
      params.push(can_draw ? 1 : 0);
    }
    if (team_name !== undefined) {
      updateQuery += ', team_name = ?';
      params.push(team_name);
    }

    updateQuery += ' WHERE id = ? AND classroom_session_id = ?';
    params.push(participantId, id);

    db.prepare(updateQuery).run(...params);
    const updatedParticipant = db.prepare('SELECT * FROM classroom_participants WHERE id = ?').get(participantId);
    
    broadcast({ type: 'PARTICIPANT_UPDATED', session_id: id, participant: updatedParticipant });
    res.json(updatedParticipant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: 'Failed to update participant' });
  }
});

sessionsRouter.put('/:id/lock', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_locked } = req.body;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    db.prepare('UPDATE classroom_sessions SET is_locked = ? WHERE id = ?').run(is_locked ? 1 : 0, id);
    const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

    broadcast({ type: 'SESSION_UPDATED', session_id: id, session: updatedSession });
    res.json(updatedSession);
  } catch (error) {
    console.error('Error locking session:', error);
    res.status(500).json({ error: 'Failed to lock session' });
  }
});

sessionsRouter.put('/:id/widgets', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { widgets_json } = req.body;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    db.prepare('UPDATE classroom_sessions SET widgets_json = ? WHERE id = ?').run(widgets_json, id);
    const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

    broadcast({ type: 'SESSION_UPDATED', session_id: id, session: updatedSession });
    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating widgets:', error);
    res.status(500).json({ error: 'Failed to update widgets' });
  }
});

sessionsRouter.put('/:id/prep', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { prep_json, subject, grade, level, lesson_goal } = req.body;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    db.prepare('UPDATE classroom_sessions SET prep_json = ?, subject = ?, grade = ?, level = ?, lesson_goal = ? WHERE id = ?').run(prep_json, subject, grade, level, lesson_goal, id);
    const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

    broadcast({ type: 'SESSION_UPDATED', session_id: id, session: updatedSession });
    res.json(updatedSession);
  } catch (error) {
    console.error('Error updating prep:', error);
    res.status(500).json({ error: 'Failed to update prep' });
  }
});



sessionsRouter.put('/:id/timer', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { duration_seconds } = req.body;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (duration_seconds === null) {
      db.prepare('UPDATE classroom_sessions SET timer_started_at = NULL, timer_duration_seconds = NULL WHERE id = ?').run(id);
    } else {
      db.prepare('UPDATE classroom_sessions SET timer_started_at = CURRENT_TIMESTAMP, timer_duration_seconds = ? WHERE id = ?').run(duration_seconds, id);
    }
    
    const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id);

    broadcast({ type: 'SESSION_UPDATED', session_id: id, session: updatedSession });
    res.json(updatedSession);
  } catch (error) {
    console.error('Error setting timer:', error);
    res.status(500).json({ error: 'Failed to set timer' });
  }
});

sessionsRouter.get('/:id/signals', (req: Request, res: Response) => {
  try {
    const signals = db.prepare('SELECT * FROM classroom_signals WHERE classroom_session_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

sessionsRouter.get('/:id/summaries', (req: Request, res: Response) => {
  try {
    const summaries = db.prepare('SELECT * FROM classroom_summaries WHERE classroom_session_id = ? ORDER BY generated_at DESC').all(req.params.id);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

sessionsRouter.get('/:id/prompts', (req: Request, res: Response) => {
  try {
    const prompts = db.prepare('SELECT * FROM classroom_prompts WHERE classroom_session_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

sessionsRouter.get('/:id/prompts/:promptId', (req: Request, res: Response) => {
  try {
    const prompt = db.prepare('SELECT * FROM classroom_prompts WHERE id = ?').get(req.params.promptId);
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

sessionsRouter.post('/:id/prompts', (req: Request, res: Response) => {
  try {
    const { title, prompt_text, prompt_type, response_mode, target_participant_id } = req.body;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const promptId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO classroom_prompts (id, classroom_session_id, created_by_user_id, phase, prompt_type, title, prompt_text, response_mode, target_participant_id, status, opened_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', CURRENT_TIMESTAMP)
    `);
    stmt.run(promptId, session.id, session.teacher_user_id, session.active_phase, prompt_type || 'OPEN_ENDED', title, prompt_text, response_mode || 'TEXT', target_participant_id || null);

    db.prepare('UPDATE classroom_sessions SET active_prompt_id = ? WHERE id = ?').run(promptId, session.id);
    const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(session.id);
    const prompt = db.prepare('SELECT * FROM classroom_prompts WHERE id = ?').get(promptId);

    broadcast({ type: 'PROMPT_CREATED', session_id: session.id, prompt, session: updatedSession });
    res.status(201).json(prompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

sessionsRouter.post('/:id/prompts/:promptId/close', (req: Request, res: Response) => {
  try {
    const { id, promptId } = req.params;
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(id) as any;
    if (!session) return res.status(404).json({ error: 'Session not found' });

    db.prepare('UPDATE classroom_prompts SET status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?').run('CLOSED', promptId);
    db.prepare('UPDATE classroom_sessions SET active_prompt_id = NULL WHERE id = ?').run(session.id);
    
    const updatedSession = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(session.id);
    const prompt = db.prepare('SELECT * FROM classroom_prompts WHERE id = ?').get(promptId);

    broadcast({ type: 'PROMPT_CLOSED', session_id: session.id, prompt, session: updatedSession });
    res.json(prompt);
  } catch (error) {
    console.error('Error closing prompt:', error);
    res.status(500).json({ error: 'Failed to close prompt' });
  }
});

sessionsRouter.put('/:id/phase', (req: Request, res: Response) => {
  const { active_phase } = req.body;
  try {
    db.prepare('UPDATE classroom_sessions SET active_phase = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(active_phase, req.params.id);
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
    
    broadcast({ type: 'PHASE_CHANGED', session_id: req.params.id, active_phase });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update phase' });
  }
});

sessionsRouter.put('/:id/share-signal', (req: Request, res: Response) => {
  const { shared_signal_id } = req.body;
  try {
    db.prepare('UPDATE classroom_sessions SET shared_signal_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(shared_signal_id, req.params.id);
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
    
    broadcast({ type: 'SESSION_UPDATED', session_id: req.params.id, session });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to share signal' });
  }
});

sessionsRouter.put('/:id/end', (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE classroom_sessions SET status = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('ENDED', req.params.id);
    const session = db.prepare('SELECT * FROM classroom_sessions WHERE id = ?').get(req.params.id);
    
    broadcast({ type: 'SESSION_ENDED', session_id: req.params.id });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});