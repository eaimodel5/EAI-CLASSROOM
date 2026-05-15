# EAI CLASSROOM — SSOT 16.2 Runtime Integratieplan

## Versie

v1.0

---

# Doel

De bestaande SSOT 16.2 bevat al een sterke didactische basis:

- procesfasen
- kennissoorten
- co-regulatie
- feedback literacy
- transferlogica
- AI-bandbreedtes
- verificatie
- trace-schema’s
- governance
- logic gates

De volgende stap is daarom niet meer didactiek toevoegen, maar de SSOT volledig laten functioneren als runtime kernel.

---

# Strategische richting

## Huidige situatie

De app gebruikt de SSOT vooral als promptcontext.

De runtime werkt nog grotendeels met:

- losse prompts
- losse endpoints
- losse AI-acties
- handmatige fase-logica

## Gewenste situatie

De runtime wordt SSOT-first:

```text
classroom signals
↓
SSOT analysis
↓
policy engine
↓
AI constraints
↓
AI generation
↓
output validation
↓
trace logging
↓
teacher intervention
```

---

# Kernprincipe

Niet:

```text
AI bepaalt de les
```

Wel:

```text
SSOT bepaalt de didactische grenzen
AI opereert daarbinnen
docent behoudt regie
```

---

# Architectuurprincipes

## 1. SSOT is canoniek

De runtime gebruikt uitsluitend de SSOT-fasen:

```text
P1
P2
P3
P4
P5
```

Niet meer:

```text
START
INSTRUCTIE
CHECK
VERWERKEN
AFSLUITING
```

De oude app-fasen verdwijnen uit runtime, database en AI-prompts.

## 2. Runtime is didactische state

State is niet alleen technisch.

State bevat:

- leerfase
- regulatievorm
- verificatiestatus
- transferstatus
- feedbackstatus
- AI-risico
- agency
- trace-completeness

## 3. AI werkt onder constraints

AI mag:

- ondersteunen
- spiegelen
- structureren
- clusteren
- begeleiden

AI mag niet:

- leerwerk overnemen
- transfer claimen zonder bewijs
- conclusies forceren
- groepsregie overnemen
- verificatie overslaan

## 4. Traceability is verplicht

Elke AI-interactie moet herleidbaar zijn.

---

# Fasenmodel

## P1 — Oriëntatie

Doel:

- context begrijpen
- opdracht verkennen
- doel expliciteren

AI mag:

- vragen stellen
- structureren
- doel helpen formuleren

AI mag niet:

- inhoudelijke oplossingen geven

## P2 — Voorkennis

Doel:

- bestaande kennis activeren
- conceptueel netwerk bouwen

AI mag:

- begrippen ordenen
- conceptmaps ondersteunen
- verbanden helpen expliciteren

AI mag niet:

- complete uitleg domineren

## P3 — Instructie

Doel:

- begrip opbouwen
- relaties verduidelijken
- modeling ondersteunen

AI mag:

- voorbeelden geven
- metaforen genereren
- checkvragen stellen

AI mag niet:

- volledige taakuitvoering doen

## P4 — Toepassen

Doel:

- zelfstandig oefenen
- fouten gebruiken
- transfer proberen

AI mag:

- hints geven
- fouten spiegelen
- scaffolden

AI mag niet:

- volledige oplossingen genereren
- leerling-denkwerk vervangen

## P5 — Evaluatie

Doel:

- kwaliteit beoordelen
- feedback wegen
- vervolg bepalen

AI mag:

- rubric ondersteunen
- reflectie structureren
- feedback vergelijken

AI mag niet:

- definitieve kwaliteitsclaims doen zonder bewijs

---

# Runtime architectuur

## 1. SSOT Runtime Kernel

Nieuw bestand:

```text
src/kernel/ssotRuntimeKernel.ts
```

## Verantwoordelijkheden

De kernel bepaalt:

- actieve phase bands
- actieve risk flags
- AI constraints
- verplichte interventions
- trace-verplichtingen
- SRL-state
- allowed actions
- blocked actions

## Input

```ts
{
  session,
  phaseBand,
  signals,
  participants,
  lessonContext,
  previousTraceEvents
}
```

## Output

```ts
{
  phaseBands: ["P4"],
  activeLogicGates: [],
  riskFlags: [],
  allowedActions: [],
  blockedActions: [],
  requiredCommands: [],
  requiredTraceEvents: [],
  recommendedTeacherMoves: [],
  learnerEvidenceRequired: []
}
```

---

# 2. Verwijder oude fasevertaling

## Huidige situatie

De app gebruikt eigen fases:

```text
START
INSTRUCTIE
CHECK
VERWERKEN
AFSLUITING
```

En vertaalt die handmatig naar SSOT-context.

## Nieuwe situatie

De app slaat direct SSOT-bands op:

```ts
type ProcessPhase = "P1" | "P2" | "P3" | "P4" | "P5";
```

## UI-labels

Voor docenten en leerlingen blijven de labels begrijpelijk:

```ts
const PHASE_LABELS = {
  P1: "Oriëntatie",
  P2: "Voorkennis",
  P3: "Instructie",
  P4: "Toepassen",
  P5: "Evaluatie"
};
```

## Database

Vervang:

```text
active_phase
```

door:

```text
active_phase_band
```

Voor backward compatibility kan tijdelijk een migration map blijven bestaan.

---

# 3. SSOT Policy Engine

Nieuw bestand:

```text
src/kernel/ssotPolicyEngine.ts
```

## Doel

De policy engine leest:

- `interaction_protocol.logic_gates`
- `command_library`
- `command_profiles`
- `flag_model`
- `intervention_model`
- `trace_schema`
- `didactic_diagnostics`

en vertaalt dat naar runtimebeslissingen.

## Voorbeeld

Bij P4 en risico op AI-dominantie:

```ts
{
  blockedActions: ["FULL_SOLUTION"],
  requiredCommands: ["/zonder_ai"],
  riskFlags: ["OVERRELIANCE_RISK"],
  requiredTraceEvents: ["INDEPENDENT_RETRY", "AUTHORSHIP_MARKING"]
}
```

---

# Logic gates activeren

## K3 — Metacognitie

Regel:

```text
AI geeft geen oplossing of eindconclusie.
```

Runtime:

- blokkeer `FULL_SOLUTION`
- verplicht reflectievraag
- verplicht leerlingkeuze

## TD5 — AI-dominantie

Regel:

```text
BLOCK_FULL_SOLUTION = true
REQUIRE_INTERVENTION = /zonder_ai
REQUIRE_TRACE = independent_retry + authorship_marking
```

Runtime:

- geen volledige uitwerking
- geen kant-en-klare conclusie
- leerling moet opnieuw zonder AI proberen
- auteurschap moet zichtbaar worden

## E1/E2 — Ongeverifieerde claims

Regel:

```text
REQUIRE_VERIFICATION = true
REQUIRE_INTERVENTION = /verify + /bronweging
```

Runtime:

- geen finale conclusie zonder verificatie
- bronweging verplicht bij meerdere bronnen
- verificatieactie opslaan in trace

## S4/S5 — Groepscontext

Regel:

```text
REQUIRE_GROUP_REGULATION_TRACE = true
REQUIRE_INTERVENTION = /ssrl_check
```

Runtime:

- groepsdoel vastleggen
- rolverdeling vastleggen
- monitoring vastleggen
- evaluatiemoment vastleggen

## L4/L5 — Transfer of duurzaam leren

Regel:

```text
REQUIRE_NO_AI_RETRY_OR_DELAYED_RECALL = true
```

Runtime:

- geen transferclaim zonder zelfstandige herneming
- delayed recall plannen of registreren
- transferpoging opslaan

---

# Trace architecture

## Nieuw database-object

```text
classroom_trace_events
```

## Minimale velden

```ts
{
  id,
  session_id,
  turn_id,
  timestamp_iso,
  phase_band,
  srl_state,
  primary_bands,
  secondary_dimensions,
  flags,
  lock_state,
  intervention_ids,
  learner_choice,
  ssot_version,
  schema_version,
  feedback_decision,
  verification_actions,
  sources_used,
  independent_retry,
  group_regulation,
  tool_role,
  tool_trace,
  transfer_attempts,
  fairness_checks,
  teacher_presence
}
```

## Event types

Ondersteun minimaal:

```text
TURN
PHASE_TRANSITION
FLAG_RAISED
LOCK_CHANGED
FEEDBACK_DECISION
VERIFICATION_ACTION
INDEPENDENT_RETRY
GROUP_REGULATION
TRANSFER_ATTEMPT
FAIRNESS_CHECK
SOURCE_CREDIBILITY_JUDGMENT
AUTHORSHIP_MARKING
DELAYED_RECALL
SHARED_GOAL_SET
SHARED_MONITORING
SHARED_EVALUATION
```

---

# AI prompt governance

## Huidige keten

```text
signals → prompt → AI
```

## Nieuwe keten

```text
signals
↓
SSOT runtime kernel
↓
policy constraints
↓
prompt builder
↓
AI
↓
output validator
↓
trace logger
```

---

# Prompt Builder

Nieuw bestand:

```text
src/server/services/promptBuilder.ts
```

## Input

```ts
{
  session,
  phaseBand,
  signals,
  ssotPolicy,
  lessonContext
}
```

## Output

Een prompt die altijd bevat:

- phase band
- doel van de fase
- actieve logic gates
- verboden acties
- verplichte interventies
- trace-eisen
- gewenste outputstructuur

---

# AI Output Validator

Nieuw bestand:

```text
src/server/services/validateAiOutput.ts
```

## Controleert

- geeft AI een volledige oplossing?
- wordt verificatie overgeslagen?
- worden leerlingnamen genoemd?
- wordt transfer te vroeg geclaimd?
- ontbreekt auteurschap?
- ontbreekt independent retry?
- ontbreekt feedbackweging?
- wordt groepsregie door AI overgenomen?

## Output

```ts
{
  valid: boolean,
  violations: [],
  correctedOutput,
  requiredFallback
}
```

---

# Verplichte AI-response metadata

Elke AI-response krijgt didactische metadata:

```json
{
  "ssot_phase_band": "P4",
  "active_logic_gates": ["TD5"],
  "risk_flags": ["OVERRELIANCE_RISK"],
  "required_command": "/zonder_ai",
  "teacher_action": "Laat leerlingen dezelfde kernstap opnieuw zonder AI uitvoeren.",
  "learner_evidence": "Zelfstandige herneming in eigen woorden.",
  "required_trace_events": ["INDEPENDENT_RETRY", "AUTHORSHIP_MARKING"]
}
```

---

# Teacher dashboard 2.0

## Doel

Het dashboard toont niet alleen signalen, maar didactische beslisinformatie.

## Bovenaan

```text
Wat vraagt nu aandacht?
```

## Direct zichtbaar

- actieve fase
- actief risico
- aanbevolen docentactie
- verplichte leerlinghandeling
- ontbrekend bewijs van leren

## Detailpanelen

- risk stack
- intervention route
- verification coverage
- independent retry status
- feedback literacy status
- shared regulation status
- transfer readiness

---

# Leerlingflow

## P1/P2

Leerling ziet:

- doelvraag
- voorkennisvraag
- korte oriëntatie

AI vraagt vooral:

- wat weet je al?
- wat is je doel?
- wat wil je eerst proberen?

## P3

Leerling ziet:

- uitleg
- voorbeeld
- checkvraag

AI mag:

- uitleg eenvoudiger maken
- metafoor geven
- controlevraag stellen

## P4

Leerling ziet:

- opdracht
- hintknop
- foutanalyse
- probeer-zonder-AI stap

AI mag niet:

- volledige oplossing geven

## P5

Leerling ziet:

- rubric
- feedbackkeuze
- reflectie
- eigen volgende stap

---

# Feedbackcyclus

Elke taak krijgt een cyclische status:

```text
draft
feedback_received
feedback_weighed
revision_done
reflection_done
```

## Verplichte reflectie

Bij gebruik van AI-feedback:

```text
Welke feedback neem je over?
Welke feedback neem je niet over?
Waarom?
Wat is van jou en wat komt van AI?
```

---

# Feedforward 2.0

## Bestaande functie

De huidige app heeft al feedforward.

## Uitbreiding

Nieuwe response:

```json
{
  "recapStart": "...",
  "dominant_bands": ["P4", "P5"],
  "risk_patterns": ["OVERRELIANCE_RISK"],
  "missing_evidence": ["INDEPENDENT_RETRY"],
  "recommended_interventions": ["/zonder_ai", "/feedback_keuze"],
  "verification_gaps": [],
  "retry_targets": [],
  "nextGoalSuggestion": "...",
  "rationale": "..."
}
```

## Doel

De volgende les start niet alleen op basis van gevoel, maar op basis van trace-data.

---

# SRL Runtime

## Gebruik SSOT srl_model actief

States:

```text
PLAN
MONITOR
REFLECT
ADJUST
```

## Runtimegedrag

Elke fase krijgt een SRL-status.

Voorbeeld:

```ts
{
  phase_band: "P4",
  srl_state: "MONITOR"
}
```

AI past gedrag daarop aan.

---

# Multi-agent voorbereiding

De SSOT maakt meerdere agents mogelijk.

## Mogelijke agents

- teacher agent
- learner agent
- group regulation agent
- verification agent
- curriculum agent
- feedback validator agent

## Voorwaarde

Alle agents gebruiken:

- dezelfde SSOT
- dezelfde trace schema’s
- dezelfde logic gates
- dezelfde command profiles

---

# Technische fasering

## Sprint 1 — Canonieke fases

Doel:

- oude fase-namen vervangen
- database aanpassen
- UI-labels koppelen aan P1-P5

Taken:

- `ProcessPhase` type maken
- oude strings migreren
- dashboard aanpassen
- student view aanpassen
- AI-routes aanpassen

Resultaat:

```text
SSOT-fasen zijn runtime-taal
```

---

## Sprint 2 — SSOT Runtime Kernel

Taken:

- `ssotRuntimeKernel.ts`
- SSOT loader verbeteren
- policy evaluation maken
- logic gates uitlezen
- risk flags bepalen

Resultaat:

```text
Elke AI-route krijgt eerst SSOT-beleid
```

---

## Sprint 3 — Trace logging

Taken:

- database tabel `classroom_trace_events`
- trace logger service
- logging bij fasewissel
- logging bij AI-interactie
- logging bij interventies

Resultaat:

```text
Leren en AI-gebruik worden uitlegbaar
```

---

## Sprint 4 — AI Output Validator

Taken:

- validator bouwen
- schema per AI-route
- violations detecteren
- fallback output maken
- geen leerlingnamen afdwingen

Resultaat:

```text
AI-output wordt gecontroleerd vóór weergave
```

---

## Sprint 5 — Dashboard 2.0

Taken:

- actieve SSOT-band tonen
- risk stack tonen
- next teacher move tonen
- independent retry status tonen
- verification coverage tonen

Resultaat:

```text
Docent ziet niet alleen data, maar didactische actie
```

---

## Sprint 6 — Feedback en transfer

Taken:

- feedbackcyclus toevoegen
- /feedback_keuze activeren
- /bronweging activeren
- /zonder_ai activeren
- delayed recall toevoegen

Resultaat:

```text
Formatief leren wordt zichtbaar als proces
```

---

# Niet doen

Niet:

- extra rubrics toevoegen zonder noodzaak
- prompts dupliceren buiten SSOT
- oude en nieuwe fase-namen naast elkaar blijven gebruiken
- AI rechtstreeks laten beslissen zonder policy
- volledige oplossingen toestaan in P4
- transfer claimen zonder zelfstandige herneming

---

# Bestandsvoorstel

## Nieuwe bestanden

```text
src/kernel/ssotRuntimeKernel.ts
src/kernel/ssotPolicyEngine.ts
src/kernel/ssotTraceSchema.ts
src/kernel/ssotTypes.ts
src/server/services/promptBuilder.ts
src/server/services/validateAiOutput.ts
src/server/services/traceLogger.ts
```

## Aan te passen bestanden

```text
src/lib/ssot.ts
src/server/routes/ai.ts
src/server/routes/sessions.ts
src/server/routes/signals.ts
src/server/routes/participants.ts
src/server/websocket.ts
src/pages/TeacherClassroomPage.tsx
src/pages/StudentClassroomPage.tsx
src/pages/ClassroomBoardPage.tsx
src/components/LessonPreparationForm.tsx
```

---

# Migratiepad

## Stap 1

Voeg P1-P5 toe naast oude fasen.

## Stap 2

Schrijf bij nieuwe sessies alleen nog P1-P5 weg.

## Stap 3

Migreer bestaande sessies.

## Stap 4

Verwijder oude fase-namen uit runtime.

## Stap 5

Laat alleen UI-labels nog menselijk vertaald worden.

---

# Acceptatiecriteria

De update is geslaagd als:

- alle sessies P1-P5 gebruiken
- AI-routes altijd via SSOT policy lopen
- volledige oplossingen worden geblokkeerd waar nodig
- trace-events worden opgeslagen
- docent ziet welke interventie logisch is
- feedbackkeuzes worden vastgelegd
- no-AI retry zichtbaar wordt
- transfer niet wordt geclaimd zonder bewijs
- dashboard laat zien wat ontbreekt voor leren

---

# Eindbeeld

De Firebase-versie wordt geen verzameling losse AI-tools.

Het wordt:

```text
een SSOT-gestuurde lesomgeving
```

met:

- duidelijke docentregie
- veilige AI
- betere feedback
- zichtbare leerlinggroei
- betere traceerbaarheid
- minder prompt-afhankelijkheid
- sterker formatief handelen

De SSOT blijft de bron.

De runtime voert hem uit.

De docent beslist.

De leerling leert.
