export interface ClassroomSession {
  id: string;
  teacher_user_id: string;
  session_code: string;
  title: string | null;
  subject: string;
  grade: string | null;
  level: string | null;
  lesson_goal: string | null;
  active_phase: 'START' | 'INSTRUCTION' | 'PRACTICE' | 'CLOSING';
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'ENDED';
  board_message: string | null;
  active_prompt_id: string | null;
  timer_started_at: string | null;
  timer_duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassroomParticipant {
  id: string;
  classroom_session_id: string;
  student_user_id: string | null;
  display_name: string;
  participant_key: string;
  join_status: 'JOINED' | 'ACTIVE' | 'IDLE' | 'LEFT';
  device_type: string | null;
  joined_at: string;
  last_seen_at: string;
}

export interface ClassroomSignal {
  id: string;
  classroom_session_id: string;
  participant_id: string;
  prompt_id: string | null;
  phase: string;
  signal_type: 'HELP' | 'WORD' | 'CHECK' | 'EXIT';
  subtype: string | null;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  text_value: string | null;
  short_code_value: string | null;
  numeric_value: number | null;
  choice_value: string | null;
  created_at: string;
}

export interface ClassroomSummary {
  id: string;
  classroom_session_id: string;
  phase: string;
  summary_type: string;
  headline: string;
  body: string | null;
  evidence_count: number | null;
  confidence_label: string | null;
  summary_json: string | null;
  generator_type: string;
  is_active: boolean;
  generated_at: string;
  created_at: string;
}
