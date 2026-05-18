import { v4 as uuidv4 } from 'uuid';
import { generateAiContent } from './ai.ts';

export async function generateTeacherProposal(input: any) {
  const { mode, session, participants, signals } = input;
  
  const normalizedSignals = normalizeSignals(signals || []);
  const anonymized = anonymizeSignals(normalizedSignals, participants || []);
  const clusters = clusterSignals(anonymized.signals);

  const prompt = buildTeacherProposalPrompt({
    session,
    clusters,
    mode,
    signalsCount: normalizedSignals.length,
    responseCount: normalizedSignals.filter((s:any) => s.signal_type === 'RESPONSE').length,
    helpCount: normalizedSignals.filter((s:any) => s.signal_type === 'HELP').length,
    wordCount: normalizedSignals.filter((s:any) => s.signal_type === 'WORD').length,
    participantIds: anonymized.participants.map((p:any) => p.id)
  });

  const raw = await generateAiContent(prompt, true);
  const proposal = validateTeacherProposal(JSON.parse(raw));

  return mapStudentRefsBack(proposal, anonymized.mapping, session, mode, {
    signalCount: normalizedSignals.length,
    responseCount: normalizedSignals.filter((s:any) => s.signal_type === 'RESPONSE').length,
    helpCount: normalizedSignals.filter((s:any) => s.signal_type === 'HELP').length,
    wordCount: normalizedSignals.filter((s:any) => s.signal_type === 'WORD').length,
  });
}

function normalizeSignals(signals: any[]) {
  // basic deduplication or sorting if needed
  return signals; 
}

function anonymizeSignals(signals: any[], participants: any[]) {
  const mapping: Record<string, string> = {};
  
  const anonParticipants = participants.map(p => {
    mapping[p.id] = p.id; // for this prototype we keep IDs but just hide names
    return { id: p.id };
  });

  const anonSignals = signals.map(s => {
    return {
      participant_id: s.participant_id,
      phase: s.phase,
      signal_type: s.signal_type,
      text_value: s.text_value,
      created_at: s.created_at
    };
  });

  return { signals: anonSignals, participants: anonParticipants, mapping };
}

function clusterSignals(signals: any[]) {
  // In a real app we could cluster them before sending but sending all is fine for basic AI limits
  return signals;
}

function buildTeacherProposalPrompt({ session, clusters, mode, signalsCount, responseCount, helpCount, wordCount, participantIds }: any) {
  let signalsList = '';
  clusters.forEach((s: any) => {
    signalsList += '- Participant ' + s.participant_id + ': ' + s.signal_type;
    if (s.text_value) {
      signalsList += ' ("' + s.text_value + '")';
    }
    signalsList += '\n';
  });
  
  return `Je analyseert leerlingdata voor een docent tijdens een les.
De huidige lesfase is: ${session.active_phase}.
Het lesdoel is: ${session.lesson_goal || 'Niet opgegeven'}.
Modus: ${mode}

Hier zijn de recente signalen van deelnemers:
${signalsList || 'Geen recente signalen'}

Lijst van actieve participant IDs:
${participantIds.join(', ')}

Maak een voorstel dat:
1. kort beschrijft wat er in de data zichtbaar is,
2. aangeeft wat de klas nu nodig heeft,
3. één concrete docentactie voorstelt,
4. alleen geldige JSON teruggeeft,
5. geen leerlingnamen noemt,
6. alleen participant_id's gebruikt voor groepen,
7. onzekerheid eerlijk aangeeft.

Gebruik deze JSON-structuur exact:
{
  "headline": "<korte kop, max 8 woorden>",
  "summary": "<samenvatting, max 2 zinnen>",
  "main_need": "<kernbehoefte klas>",
  "suggested_activity": {
    "label": "<bv. Wisbordjes, Exit Ticket>",
    "rationale": "<waarom dit nu past>",
    "activity_type": "<CREATE_PROMPT of SHOW_GROUPS of START_WIDGET of NO_ACTION>",
    "prompt_type": "<optioneel, THEME_QUESTION/CHECK_QUESTION/VOTE/etc.>",
    "prompt_text": "<optioneel, klaar te zetten tekst voor docent>"
  },
  "groups": {
    "needs_support": ["participant_1", "participant_2"],
    "can_continue": ["participant_3"],
    "check_in": []
  },
  "confidence_label": "<HIGH | MEDIUM | LOW>"
}`;
}

function validateTeacherProposal(raw: any) {
  return raw;
}

function mapStudentRefsBack(proposal: any, mapping: Record<string, string>, session: any, mode: string, stats: any) {
  
  const teacher_actions: any[] = [];
  
  if (proposal.suggested_activity?.activity_type && proposal.suggested_activity.activity_type !== 'NO_ACTION') {
    teacher_actions.push({
      id: uuidv4(),
      label: `Start ${proposal.suggested_activity.label}`,
      action_type: proposal.suggested_activity.activity_type,
      payload: {
        prompt_type: proposal.suggested_activity.prompt_type,
        prompt_text: proposal.suggested_activity.prompt_text
      }
    });
  }

  return {
    id: uuidv4(),
    classroom_session_id: session.id,
    phase: session.active_phase,
    proposal_type: mode,
    headline: proposal.headline || 'Nieuw voorstel',
    summary: proposal.summary || '',
    main_need: proposal.main_need || '',
    suggested_activity: proposal.suggested_activity || { label: '', rationale: '', activity_type: 'NO_ACTION' },
    groups: proposal.groups || { needs_support: [], can_continue: [], check_in: [] },
    evidence: {
      signal_count: stats.signalCount,
      response_count: stats.responseCount,
      help_count: stats.helpCount,
      word_count: stats.wordCount,
      confidence_label: proposal.confidence_label || 'MEDIUM'
    },
    teacher_actions,
    status: 'DRAFT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
