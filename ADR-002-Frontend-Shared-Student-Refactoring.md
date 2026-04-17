# ADR 002: Frontend Architectuur Voltooien (Shared, Student, Board)

## 1. Status
**Voorgesteld** (Wachtend op goedkeuring)

## 2. Context & Probleemstelling
Na de succesvolle refactor van de \`TeacherClassroomPage\` (ADR 001) bevinden \`StudentClassroomPage.tsx\` (>500 regels) en \`ClassroomBoardPage.tsx\` (>400 regels) zich nog in een verouderde "God Object" staat. Bovendien is er sprake van gedupliceerde code (bijv. de \`TimerDisplay\` staat in drie verschillende bestanden gekopieerd).

Dit leidt tot:
- Een inconsistente frontend architectuur (50% DDD, 50% chaos).
- Gevaar op asynchrone fouten (bijv. als de timer-logica op één plek wordt geüpdatet, maar niet ergens anders).
- Moeilijkheden om in de toekomst nieuwe student-interacties toe te voegen.

## 3. Doelstelling
De Domain-Driven Design (DDD) structuur doortrekken naar de resterende rollen (\`student\` en \`board\`). Gedupliceerde UI-componenten en logica centraliseren naar een \`shared\` map.

## 4. Strikte Spelregels (Constraints)
1. **Scope:** Refactor ALLEEN frontend-code gekoppeld aan de Student, Board en Shared componenten. Raak \`server.ts\` (de backend) absoluut NIET aan.
2. **Geen Redesign:** De UI en styling (Tailwind classes) blijven exact behouden.
3. **Geen Nieuwe Features:** Alleen architectuur en bestandsstructuur veranderen, geen functionaliteit toevoegen.
4. **DRY Principe:** Identieke code (zoals TimerDisplay) mag nog maar op 1 plek bestaan.
5. **Dunne Orkestratie:** Pagina's worden puur een verzameling van componenten en hooks.

## 5. Doelarchitectuur

### 5.1. Shared (Gedeeld over meerdere domeinen)
- \`src/components/shared/TimerDisplay.tsx\`: De generieke timer die aftelt op basis van sessie-data (krijgt styling en data door als props).

### 5.2. Student Domein (\`src/domains/student/\`)
- **Hooks:**
  - \`useStudentSession.ts\`: WebSockets, state van actieve prompts en sessie wijzigingen.
- **Componenten:**
  - \`StudentHeader.tsx\`: De balk met klasinformatie, gebruikersnaam en de Timer.
  - \`JoinSessionForm.tsx\`: Het inlogformulier (sessiecode + naam).
  - \`ActivePromptOverlay.tsx\`: De weergave voor de leerling om te reageren op een actieve vraag (Check, Hint, Exit ticket, etc.).
  - \`StudentSignalControls.tsx\`: De knoppen om "Hulp Nodig" of "Klaar" te klikken.
- **Pagina:**
  - \`src/domains/student/pages/StudentClassroomPage.tsx\`

### 5.3. Board Domein (\`src/domains/board/\`)
- **Hooks:**
  - \`useBoardSession.ts\`: WebSockets specifiek voor het centrale bord, luistert naar gedeelde signalen en statuswijzigingen.
- **Componenten:**
  - \`BoardHeader.tsx\`: Grote weergave van sessiecode en de grote Timer.
  - \`BoardActivePrompt.tsx\`: Wat er momenteel centraal besproken wordt.
  - \`BoardSharedSignal.tsx\`: Het uitgelichte antwoord van een leerling.
- **Pagina:**
  - \`src/domains/board/pages/ClassroomBoardPage.tsx\`

## 6. Uitvoeringsplan & Checklist (Door AI uit te voeren)

- [x] **Stap 1: Shared Componenten**
  - Maak \`src/components/shared\` aan.
  - Extraheer de \`TimerDisplay\` naar een centraal component en ruim de imports/duplicaten op.
- [x] **Stap 2: Mappenstructuur aanmaken**
  - Creëer \`src/domains/student\` en \`src/domains/board\` met interne mappen voor \`components\`, \`hooks\` en \`pages\`.
- [x] **Stap 3: Student Domein Refactor**
  - Extract de logica naar \`useStudentSession.ts\`.
  - Extract de UI naar de 4 bovengenoemde componenten.
  - Herschrijf \`StudentClassroomPage.tsx\` en zet deze in het \`student\` domein. 
  - Update proxy in root \`src/pages/\` map.
- [x] **Stap 4: Board Domein Refactor**
  - Extract de logica naar \`useBoardSession.ts\`.
  - Extract de UI naar de 3 bovengenoemde componenten.
  - Herschrijf \`ClassroomBoardPage.tsx\` en zet deze in het \`board\` domein.
  - Update proxy in root \`src/pages/\` map.
- [x] **Stap 5: Verificatie**
  - Compileer de applicatie (\`npm run build\`).
  - Zorg dat de routing in \`App.tsx\` blijft functioneren.
  
## 7. Goedkeuring
Dit document dient als het bindende contract voor ADR 002. Pas na goedkeuring van de "GO" door de gebruiker, zal de AI-agent starten.
