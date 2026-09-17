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

  const rawTitle = cleanString(workingPrep.title);
  const rawSubject = cleanString(workingPrep.subject);
  const rawLearningGoal = cleanString(workingPrep.learningGoal);

  if (!rawTitle) {
    warnings.push('Geen titel opgegeven; standaard titeltoegepast.');
  }
  if (!rawSubject) {
    warnings.push('Geen vak opgegeven; standaard vaktoegepast.');
  }
  if (!rawLearningGoal) {
    warnings.push('Geen specifiek leerdoel geformuleerd.');
  }

  // Gevalideerde en genormaliseerde velden
  const subject = rawSubject || 'Algemeen';
  const title = rawTitle || `${subject} Les (${new Date().toLocaleDateString('nl-NL')})`;
  const className = cleanString(workingPrep.className);
  const gradeYear = cleanString(workingPrep.gradeYear);
  const level = cleanString(workingPrep.level);
  const learningGoal = rawLearningGoal || 'Kennis- en vaardigheidsverdieping tijdens de les.';
  const teacherNotes = cleanString(workingPrep.teacherNotes);

  // Schone arrays zonder lege witregels of loze elementen
  const successCriteria = cleanStringArray(workingPrep.successCriteria);
  const priorKnowledgeQuestions = cleanStringArray(workingPrep.priorKnowledgeQuestions);
  const instructionActivities = cleanStringArray(workingPrep.instructionActivities);
  const checkQuestions = cleanStringArray(workingPrep.checkQuestions);
  const processingActivities = cleanStringArray(workingPrep.processingActivities);
  const misconceptions = cleanStringArray(workingPrep.misconceptions);
  const interventions = cleanStringArray(workingPrep.interventions);
  const exitTicketQuestions = cleanStringArray(workingPrep.exitTicketQuestions);

  // Vaste, stabiele structuur voor de 5 fasen
  const phases: Record<'START' | 'INSTRUCTIE' | 'CHECK' | 'VERWERKEN' | 'AFSLUITING', CompiledPhasePlan> = {
    START: {
      phase: 'START',
      title: 'Start & Voorkennis',
      items: priorKnowledgeQuestions.length > 0 
        ? priorKnowledgeQuestions 
        : [`Wat weet je al over ${title}? Denk 1 minuut na en bespreek met je buur.`]
    },
    INSTRUCTIE: {
      phase: 'INSTRUCTIE',
      title: 'Instructie & Modelen',
      items: instructionActivities.length > 0 
        ? instructionActivities 
        : [`Toelichting en kerninstructie door docent over leerdoel: ${learningGoal}`]
    },
    CHECK: {
      phase: 'CHECK',
      title: 'Formatieve Check',
      items: [
        ...(checkQuestions.length > 0 ? checkQuestions : [`Begrijp je de kernstap? Geef een signaal of antwoord.`]),
        ...(misconceptions.map((m) => `Let op denkfout: ${m}`)),
        ...(interventions.map((i) => `Hulpactie: ${i}`))
      ]
    },
    VERWERKEN: {
      phase: 'VERWERKEN',
      title: 'Zelfstandige Verwerking',
      items: processingActivities.length > 0 
        ? processingActivities 
        : [`Zelfstandig of in tweetallen werken aan de lesstof.`]
    },
    AFSLUITING: {
      phase: 'AFSLUITING',
      title: 'Afsluiting & Exit-Ticket',
      items: exitTicketQuestions.length > 0 
        ? exitTicketQuestions 
        : [`Formuleer in één zin wat je vandaag hebt geleerd over het leerdoel.`],
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
    phases,
    rawPrep: { ...workingPrep }
  };

  return {
    valid: true,
    warnings,
    snapshot
  };
}
