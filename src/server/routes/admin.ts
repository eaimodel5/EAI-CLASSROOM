import { Router, Request, Response } from 'express';
import db from '../../db/index.ts';

export const adminRouter = Router();

adminRouter.get('/settings', (req: Request, res: Response) => {
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

adminRouter.put('/settings', (req: Request, res: Response) => {
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

adminRouter.get('/sessions', (req: Request, res: Response) => {
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

adminRouter.post('/sessions/:id/end', (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE classroom_sessions SET status = "ENDED", closed_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});

adminRouter.delete('/sessions/:id', (req: Request, res: Response) => {
  try {
    // Delete cascades due to foreign key constraints
    db.prepare('DELETE FROM classroom_sessions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

adminRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const totalSessions = db.prepare('SELECT COUNT(*) as count FROM classroom_sessions').get() as { count: number };
    const activeSessions = db.prepare("SELECT COUNT(*) as count FROM classroom_sessions WHERE status = 'ACTIVE'").get() as { count: number };
    const totalParticipants = db.prepare('SELECT COUNT(*) as count FROM classroom_participants').get() as { count: number };
    const totalSignals = db.prepare('SELECT COUNT(*) as count FROM classroom_signals').get() as { count: number };

    res.json({
      totalSessions: totalSessions.count,
      activeSessions: activeSessions.count,
      totalParticipants: totalParticipants.count,
      totalSignals: totalSignals.count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
