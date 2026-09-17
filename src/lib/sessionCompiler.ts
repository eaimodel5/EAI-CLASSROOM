import { LessonPreparation, SessionSnapshot, CompiledPhasePlan } from '../types';

/**
 * Helper to clean and trim a single string, returning fallback if empty.
 */
function cleanString(value?: string | null, fallback = ''): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Helper to clean a list of strings: trims items and removes empty/whitespace entries.
 */
function cleanStringArray(arr?: string[] | null): string[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

export interface SessionCompileResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  snapshot: SessionSnapshot;
}

/**
 * Centrale validatie en compileer-stap vlak voor sessiestart.
 * Dit is een 100% technische stap (geen AI call).
 * Transformeert het bewerkbare werkdocument naar een onveranderlijke, stabiele sessiesnapshot.
 */
export function compileSessionSnapshot(workingPrep: LessonPreparation): SessionCompileResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const rawTitle = cleanString(workingPrep.title);
  const rawSubject = cleanString(workingPrep.subject);
  const rawLearningGoal = cleanString(workingPrep.learningGoal);

  if (!rawTitle) {
    warnings.push('Geen titel opgegeven.');
  }

  // Strict validatie: Vak en Leerdoel zijn vereist
  if (!rawSubject) {
    errors.push('Vak ontbreekt. Dit is verplicht voor de sessie.');
  }
  if (!rawLearningGoal) {
    errors.push('Leerdoel ontbreekt. Dit is verplicht voor de sessie.');
  }

  // Schone arrays zonder lege witregels of loze elementen
  const successCriteria = cleanStringArray(workingPrep.successCriteria);
  const priorKnowledgeQuestions = cleanStringArray(workingPrep.priorKnowledgeQuestions);
  const instructionActivities = cleanStringArray(workingPrep.instructionActivities);
  const checkQuestions = cleanStringArray(workingPrep.checkQuestions);
  const processingActivities = cleanStringArray(workingPrep.processingActivities);
  const misconceptions = cleanStringArray(workingPrep.misconceptions);
  const interventions = cleanStringArray(workingPrep.interventions);
  const exitTicketQuestions = cleanStringArray(workingPrep.exitTicketQuestions);

  // Inhoudelijke warnings
  if (successCriteria.length === 0) warnings.push('Geen succescriteria opgegeven.');
  if (priorKnowledgeQuestions.length === 0) warnings.push('Geen startvragen of voorkennisvragen opgegeven.');
  if (misconceptions.length === 0) warnings.push('Geen misconcepties opgegeven.');

  // Gevalideerde en genormaliseerde velden
  const subject = rawSubject || '';
  const title = rawTitle || '';
  const className = cleanString(workingPrep.className);
  const gradeYear = cleanString(workingPrep.gradeYear);
  const level = cleanString(workingPrep.level);
  const learningGoal = rawLearningGoal || '';
  const teacherNotes = cleanString(workingPrep.teacherNotes);

  // Vaste, stabiele structuur voor de 5 fasen
  const phases: Record<'START' | 'INSTRUCTIE' | 'CHECK' | 'VERWERKEN' | 'AFSLUITING', CompiledPhasePlan> = {
    START: {
      phase: 'START',
      title: 'Start & Voorkennis',
      items: priorKnowledgeQuestions
    },
    INSTRUCTIE: {
      phase: 'INSTRUCTIE',
      title: 'Instructie & Modelen',
      items: instructionActivities
    },
    CHECK: {
      phase: 'CHECK',
      title: 'Formatieve Check',
      items: [
        ...checkQuestions,
        ...(misconceptions.map((m) => `Let op denkfout: ${m}`)),
        ...(interventions.map((i) => `Hulpactie: ${i}`))
      ]
    },
    VERWERKEN: {
      phase: 'VERWERKEN',
      title: 'Zelfstandige Verwerking',
      items: processingActivities
    },
    AFSLUITING: {
      phase: 'AFSLUITING',
      title: 'Afsluiting & Exit-Ticket',
      items: exitTicketQuestions,
      notes: teacherNotes || undefined
    }
  };

  const snapshotId = `snap_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const compiledAt = new Date().toISOString();

  const snapshot: SessionSnapshot = {
    title,
    subject,
    className,
    gradeYear,
    level,
    learningGoal,
    successCriteria,
    priorKnowledgeQuestions,
    instructionActivities,
    checkQuestions,
    processingActivities,
    misconceptions,
    interventions,
    exitTicketQuestions,
    teacherNotes,
    snapshotId,
    compiledAt,
    version: '1.0',
    isCompiled: true,
    phases
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    snapshot
  };
}
