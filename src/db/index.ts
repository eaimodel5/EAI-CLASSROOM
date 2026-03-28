import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'classroom.db'));

db.pragma('journal_mode = WAL');

// Initialize Database Schema (Blok 1)
db.exec(`
  CREATE TABLE IF NOT EXISTS classroom_sessions (
    id TEXT PRIMARY KEY,
    teacher_user_id TEXT NOT NULL,
    session_code TEXT NOT NULL UNIQUE,
    title TEXT,
    subject TEXT NOT NULL,
    grade TEXT,
    level TEXT,
    lesson_goal TEXT,
    active_phase TEXT NOT NULL,
    status TEXT NOT NULL,
    board_message TEXT,
    active_prompt_id TEXT,
    timer_started_at DATETIME,
    timer_duration_seconds INTEGER,
    is_locked INTEGER DEFAULT 0,
    shared_signal_id TEXT,
    widgets_json TEXT DEFAULT '[]',
    started_at DATETIME,
    ended_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classroom_participants (
    id TEXT PRIMARY KEY,
    classroom_session_id TEXT NOT NULL,
    student_user_id TEXT,
    display_name TEXT NOT NULL,
    participant_key TEXT NOT NULL,
    join_status TEXT NOT NULL,
    device_type TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(classroom_session_id, participant_key)
  );

  CREATE TABLE IF NOT EXISTS classroom_prompts (
    id TEXT PRIMARY KEY,
    classroom_session_id TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    prompt_type TEXT NOT NULL,
    title TEXT NOT NULL,
    prompt_text TEXT,
    response_mode TEXT NOT NULL,
    config_json TEXT,
    status TEXT NOT NULL,
    opened_at DATETIME,
    closed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classroom_signals (
    id TEXT PRIMARY KEY,
    classroom_session_id TEXT NOT NULL,
    participant_id TEXT NOT NULL,
    prompt_id TEXT,
    phase TEXT NOT NULL,
    signal_type TEXT NOT NULL,
    subtype TEXT,
    urgency TEXT,
    status TEXT NOT NULL,
    text_value TEXT,
    short_code_value TEXT,
    numeric_value REAL,
    choice_value TEXT,
    step_ref TEXT,
    source_context TEXT,
    payload_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS classroom_summaries (
    id TEXT PRIMARY KEY,
    classroom_session_id TEXT NOT NULL,
    phase TEXT NOT NULL,
    summary_type TEXT NOT NULL,
    headline TEXT NOT NULL,
    body TEXT,
    evidence_count INTEGER,
    confidence_label TEXT,
    summary_json TEXT,
    generator_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Migrations
try {
  db.exec(`ALTER TABLE classroom_sessions ADD COLUMN is_locked INTEGER DEFAULT 0;`);
} catch (e) {
  // Column might already exist
}

try {
  db.exec(`ALTER TABLE classroom_sessions ADD COLUMN shared_signal_id TEXT;`);
} catch (e) {
  // Column might already exist
}

// Insert default settings if they don't exist
const defaultSettings = [
  { key: 'theme_color_primary', value: '#2563eb' },
  { key: 'theme_font_family', value: 'Inter, sans-serif' },
  { key: 'ui_teacher_show_timer', value: 'true' },
  { key: 'ui_student_show_names', value: 'false' },
  { key: 'ui_board_animations', value: 'true' },
  { key: 'app_title', value: 'EAI CLASSROOM' }
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO admin_settings (key, value) VALUES (?, ?)');
db.transaction(() => {
  for (const setting of defaultSettings) {
    insertSetting.run(setting.key, setting.value);
  }
})();

// Add widgets_json column if it doesn't exist
try {
  db.exec("ALTER TABLE classroom_sessions ADD COLUMN widgets_json TEXT DEFAULT '[]'");
} catch (e) {
  // Ignore error if column already exists
}

export default db;
