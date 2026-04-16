# ADR 001: Refactoring TeacherClassroomPage.tsx

## 1. Status
**Voorgesteld** (Wachtend op goedkeuring)

## 2. Context & Probleemstelling
Het huidige bestand `src/pages/TeacherClassroomPage.tsx` is uitgegroeid tot een "God Object" van meer dan 1100 regels code. Het combineert complexe state management, WebSocket communicatie, API calls en diep geneste UI-rendering in één enkel bestand. 

Dit leidt tot:
- Verminderde onderhoudbaarheid en leesbaarheid.
- Hoog risico op regressiebugs bij het toevoegen van nieuwe functionaliteit.
- Moeilijkheden bij het testen van geïsoleerde componenten.

## 3. Doelstelling
Het opsplitsen van `TeacherClassroomPage.tsx` in kleinere, productieklare modules zonder het kernproduct of de functionaliteit te wijzigen. De hoofdpagina moet een "dunne" orkestratielaag worden.

## 4. Strikte Spelregels (Constraints)
Tijdens de uitvoering van deze refactor gelden de volgende keiharde eisen. De AI-agent mag hier **geen shortcuts** in nemen:

1. **Scope:** Refactor ALLEEN `TeacherClassroomPage.tsx`. Raak student- of bord-pagina's niet aan, tenzij een gedeeld type strikt noodzakelijk is.
2. **Geen Redesign:** De UI en styling (Tailwind classes) blijven exact zoals ze nu zijn.
3. **Geen Nieuwe Features:** Er wordt geen nieuwe functionaliteit toegevoegd.
4. **Geen AI-terminologie:** Gebruik functionele, klaslokaal-georiënteerde taal (Docent, Student, Bord, Les, Fase, Signaal, Interventie).
5. **Behoud Gedrag:** De huidige functionaliteit is leidend.
6. **Types:** TypeScript types blijven expliciet en strikt.
7. **Scheiding van Zorgen:** Rendering-logica (JSX) wordt gescheiden van state-logica (Hooks).

## 5. Doelarchitectuur (Domain-Driven)

We introduceren een domein-specifieke structuur voor de docent: `src/domains/teacher/`.

### 5.1. Hooks (State & Logica)
- \`src/domains/teacher/hooks/useTeacherSession.ts\`: Beheert de WebSocket verbinding, het ophalen van initiële data (sessie, signalen, deelnemers) en de live updates.
- \`src/domains/teacher/hooks/useTeacherActions.ts\`: Bevat alle mutaties (API calls) zoals het veranderen van de lesfase, het sturen van een prompt, het genereren van een samenvatting en het delen naar het bord.

### 5.2. Componenten (UI Modules)
- \`src/domains/teacher/components/SessionHeader.tsx\`: De bovenste balk met timer, sessiecode, lock-knop en 'Les Beëindigen'.
- \`src/domains/teacher/components/PhaseControls.tsx\`: De knoppen om te wisselen tussen START, INSTRUCTIE, CHECK, VERWERKEN, AFSLUITING.
- \`src/domains/teacher/components/ClassStats.tsx\`: De rij met statistieken (Aantal leerlingen, Hulpvragen, Klaar).
- \`src/domains/teacher/components/LiveFeed.tsx\`: De lijst met binnenkomende signalen van leerlingen.
- \`src/domains/teacher/components/ActivePromptCard.tsx\`: De weergave van de huidige actieve vraag en de binnenkomende antwoorden.
- \`src/domains/teacher/components/QuickActions.tsx\`: De knoppen gegenereerd vanuit de lesvoorbereiding (\`prep_json\`).
- \`src/domains/teacher/components/InterventionTools.tsx\`: De vaste didactische tools (Diagnostische vraag, Misconceptie check, Willekeurige beurt, etc.).
- \`src/domains/teacher/components/BoardControls.tsx\`: Het paneel om een bericht naar het centrale bord te sturen.
- \`src/domains/teacher/components/PromptModal.tsx\`: De modal popup voor het aanmaken/bevestigen van een nieuwe interactie.

### 5.3. Pagina (Orkestratie)
- \`src/domains/teacher/pages/TeacherClassroomPage.tsx\`: Dit bestand wordt verplaatst en gereduceerd tot een overzichtelijke layout-container die de hooks aanroept en de props doorgeeft aan de componenten.

## 6. Uitvoeringsplan & Checklist

De AI-agent zal dit plan stapsgewijs uitvoeren en mag pas naar de volgende stap als de vorige succesvol is afgerond en gecompileerd.

- [x] **Stap 1: Mappenstructuur aanmaken**
  - Creëer \`src/domains/teacher/pages\`, \`components\`, \`hooks\`, \`types\`.
- [x] **Stap 2: Logica extraheren naar Hooks**
  - Bouw \`useTeacherSession.ts\`.
  - Bouw \`useTeacherActions.ts\`.
- [x] **Stap 3: Basis UI Componenten extraheren**
  - Bouw \`SessionHeader.tsx\`.
  - Bouw \`PhaseControls.tsx\`.
  - Bouw \`ClassStats.tsx\`.
- [x] **Stap 4: Complexe UI Componenten extraheren**
  - Bouw \`LiveFeed.tsx\`.
  - Bouw \`ActivePromptCard.tsx\`.
- [x] **Stap 5: Tools & Acties extraheren**
  - Bouw \`QuickActions.tsx\`.
  - Bouw \`InterventionTools.tsx\`.
  - Bouw \`ClassManagement.tsx\` (in plaats van BoardControls).
  - Bouw \`PromptModal.tsx\`.
- [x] **Stap 6: Orkestratie Pagina opbouwen**
  - Herschrijf \`TeacherClassroomPage.tsx\` zodat deze de nieuwe structuur gebruikt.
  - Update de routing in \`App.tsx\` (indien nodig voor de nieuwe paden, of behoud de export op de oude locatie als proxy).
- [x] **Stap 7: Verificatie**
  - Compileer de applicatie (\`npm run build\`).
  - Controleer of alle functionaliteit (WebSockets, UI, API calls) intact is gebleven.

## 7. Goedkeuring
Dit document dient als het bindende contract voor de refactoring. Pas na expliciete goedkeuring van de gebruiker zal de AI-agent starten met Stap 1.
