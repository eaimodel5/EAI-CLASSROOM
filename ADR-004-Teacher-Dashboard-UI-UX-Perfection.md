# ADR 004: UI/UX Redesign & Perfection of the Teacher Dashboard

## Date
2026-05-21

## Status
Succesvol afgerond (Implemented)

## Context
Na het doorvoeren van fundamentele ai-gegenereerde lesvoorbereidingen en dynamische lesfases, is het essentieel dat we de bediening voor de docent (de TeacherClassroomPage) naar het ultieme niveau tillen. Uit gebruikersinzichten en onze visie blijkt het volgende:
1. **Laagdrempelig (Zonder Voorkennis)**: Een docent moet zonder enige eerdere EAI CLASSROOM cursus of voorkennis het dashboard kunnen openen en snappen wat de volgende stap is. Dit betekent: intuïtieve, "guided" UI en duidelijke, verhalende taal zonder abstract jargon.
2. **Compactheid & Efficiëntie**: Docenten hebben tijdens het lesgeven maximale cognitieve belasting. Het scherm mag dus niet overladen zijn met 100 knoppen. We moeten werken met een *layered approach* (gelaagdheid). Alleen de functionaliteiten die in de *huidige lesfase* relevant zijn, moeten direct prominent zichtbaar of uitklapbaar zijn.
3. **High-Density Data**: Tegelijkertijd willen we niet inleveren op pro-features (Real-time AI analyse, formatieve checks, overzichten).
4. **Visuele Professionaliteit**: Geen onnodige overvolle branding (bijv. eaihub.nl domeinnamen in het bord), maar ultrakorte gelaagde focus (Nucleus / Data-Center).

## Decision
We stappen over van een traditioneel, generiek web-dashboard naar een **3-Koloms Mission Control Matrix Layout**. Deze interface gedraagt zich als gereedschap in plaats van een "website".

### Kernarchitectuur van de nieuwe UI/UX:
1. **Ultra-compacte Top Navigatie & Fase Navigatie**: 
   - Een dunne balk met snelle statusindicatoren (live studenten, sessiecode zonder urls, connectiestatus).
   - Direct eronder een gestroomlijnde fasen-balk (`START` -> `INSTRUCTIE` -> `CHECK` -> `VERWERKEN` -> `AFSLUITING`). Bepaalt globaal welke tools in de linkerkolom verschijnen.

2. **Kolom 1: Gereedschap & Impulsen (Uitklapbaar)**
   - Bevat het dynamische Lesplan / QuickActions per fase. 
   - Als docent zit je in "INSTRUCTIE"? Dan toont deze kolom meteen (zonder klikken) je diagnostische denkvragen.
   - Kan ingeklapt worden tot een smalle icon-strip om ruimte vrij te maken voor de Live Feed.

3. **Kolom 2: Nucleus / Live Data-Center**
   - Heeft altijd de meeste breedte en focus.
   - Schakelt dynamisch: Heeft de docent een vraag 'open/live' staan? Dan vult deze kolom zich met de *Active Prompt Card* en de inkomende signalen in real-time.
   - Staat er niets open? Dan is dit de algemene radiostroom (Live Feed) van de klas.

4. **Kolom 3: Analyse & Regie (Uitklapbaar)**
   - De plek voor de "onzichtbare co-teacher" (AI).
   - "Scan Klas" knop prominent bovenin, gevolgd door AI-Voorstellen (Teacher Proposals). 
   - Onderin het hardware / systeembeheer: Scherm-locks, timers en afsluiten.

## Component Refactoring Strategie
Om de transitie veilig te doen, refactoren we stapsgewijs:
1. **Fase 1: State & Shell** (Aanmaken van state variabelen voor uitklappen linker/rechter paneel, herbouwen van the `TeacherClassroomPage` lay-out matrix `<main>` en `<section>` containers).
2. **Fase 2: Header & Navigatie** (Fase-balk loskoppelen en netjes integreren in de nieuwe compacte balk).
3. **Fase 3: Linker Kolom Implementatie** (QuickActions en InterventionTools visueel inkapsulen in de collapsable linker sectie).
4. **Fase 4: Rechter Kolom & AI Integratie** (Het paneel voor Analyse & Regie opstellen met pro-active AI componenten).
5. **Fase 5: Middenkolom (Nucleus)** (Visuele polijsting van ActivePrompt vs Monitoring stream).

## Consequences
**Positief**: 
- Enorme afname in "visual noise" door inklapbare rand-panelen.
- Docent wordt gestuurd per fase, wat de adoptiekans door docenten zonder voorkennis vergroot.
- Ruimte voor real-time data visualisatie (hart van het systeem).

**Negatief**:
- Vereist verfijnde CSS / Tailwind manipulatie met Flexbox (om `overflow` netjes af te vangen).
- De React component tree van `TeacherClassroomPage` wordt iets complexer door de extra state variables voor uitklappen. Dit compenseren we met strikte component-extractie.

## Review: Mijlpaal Behaald
*Update JUNI 2026:* De voorgestelde UI verbeteringen, de volledige integratie van Firestore, en de gelaagde widget- en lesson prep functies, zijn stuk voor stuk succesvol doorgevoerd. Alles is perfect in harmonie. Dit is een aanzienlijke mijlpaal in ons traject. Hierdoor kunnen we voortaan de rigide structuur ("anchorpoints" / strikte checks) iets meer loslaten in onze verdere doorontwikkeling. We hebben stevige fundamenten gelegd. We kunnen nu meer de focus leggen op wendbare productdoorontwikkeling.
