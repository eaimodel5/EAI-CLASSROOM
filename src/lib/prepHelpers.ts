import { ClassroomSession, LessonPreparation, SessionSnapshot } from '../types';

/**
 * Helper to safely parse JSON strings without crashing the application.
 */
function safeParsePrep(value?: string | null): any | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Gets the active lesson preparation for the current session.
 * This is the state currently being used and potentially edited during the session.
 * 
 * Hierarchy:
 * 1. runtime_prep_json (edited during the session)
 * 2. session_snapshot_json (the compiled start snapshot)
 * 3. prep_json (fallback for legacy sessions)
 */
export function getActiveLessonPrep(session: ClassroomSession | null): LessonPreparation | SessionSnapshot | null {
  if (!session) return null;

  return safeParsePrep(session.runtime_prep_json) 
      || safeParsePrep(session.session_snapshot_json) 
      || safeParsePrep(session.prep_json);
}

/**
 * Gets the original compiled snapshot created when the session started.
 * This represents the immutable start state.
 * 
 * Hierarchy:
 * 1. session_snapshot_json (the compiled start snapshot)
 * 2. prep_json (fallback for legacy sessions)
 */
export function getStartLessonSnapshot(session: ClassroomSession | null): SessionSnapshot | LessonPreparation | null {
  if (!session) return null;

  return safeParsePrep(session.session_snapshot_json) 
      || safeParsePrep(session.prep_json);
}
