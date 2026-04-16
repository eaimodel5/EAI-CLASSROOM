export type PromptType = 
  | 'CHECK_QUESTION' 
  | 'HINT' 
  | 'REFLECTION' 
  | 'DIAGNOSTIC' 
  | 'MISCONCEPTION' 
  | 'GO_NO_GO' 
  | 'CONFIDENCE' 
  | 'CLASS_INTERVENTION' 
  | 'EXIT_TICKET' 
  | 'PRIOR_KNOWLEDGE' 
  | 'PEER_FEEDBACK' 
  | 'WHEEL_OF_NAMES';

export interface PromptConfig {
  title: string;
  label: string;
  placeholder: string;
  color: string;
  responseMode: 'TEXT' | 'ACKNOWLEDGE';
}

export const PROMPT_CONFIG: Record<PromptType, PromptConfig> = {
  CHECK_QUESTION: { title: 'Checkvraag', label: 'Wat wil je de leerlingen vragen?', placeholder: 'Bijv. Wat is de belangrijkste oorzaak van...', color: 'bg-indigo-600 hover:bg-indigo-700', responseMode: 'TEXT' },
  HINT: { title: 'Hint', label: 'Welke hint wil je delen?', placeholder: 'Bijv. Let op de eenheden bij het berekenen van...', color: 'bg-amber-600 hover:bg-amber-700', responseMode: 'ACKNOWLEDGE' },
  REFLECTION: { title: 'Reflectie', label: 'Waar wil je dat de leerlingen op reflecteren?', placeholder: 'Bijv. Wat vond je het lastigst aan deze opdracht?', color: 'bg-emerald-600 hover:bg-emerald-700', responseMode: 'TEXT' },
  DIAGNOSTIC: { title: 'Diagnostische Vraag', label: 'Stel een diagnostische vraag', placeholder: 'Bijv. Welke stap in de berekening is fout?', color: 'bg-indigo-600 hover:bg-indigo-700', responseMode: 'TEXT' },
  MISCONCEPTION: { title: 'Misconceptie Check', label: 'Welke misconceptie wil je toetsen?', placeholder: 'Bijv. Waarom is het niet waar dat...', color: 'bg-orange-600 hover:bg-orange-700', responseMode: 'TEXT' },
  GO_NO_GO: { title: 'Doorgaan / Niet-doorgaan', label: 'Wat is de checkvraag voor de volgende stap?', placeholder: 'Bijv. Ben je klaar om te beginnen met...', color: 'bg-indigo-600 hover:bg-indigo-700', responseMode: 'TEXT' },
  CONFIDENCE: { title: 'Confidence Meter', label: 'Waarover wil je het vertrouwen peilen?', placeholder: 'Bijv. Hoe zeker ben je over je antwoord?', color: 'bg-emerald-600 hover:bg-emerald-700', responseMode: 'TEXT' },
  CLASS_INTERVENTION: { title: 'Klassikale Interventie', label: 'Wat wil je klassikaal bespreken?', placeholder: 'Bijv. Ik zie dat veel leerlingen vastlopen op...', color: 'bg-red-600 hover:bg-red-700', responseMode: 'ACKNOWLEDGE' },
  EXIT_TICKET: { title: 'Exit Ticket', label: 'Wat is de afsluitende vraag?', placeholder: 'Bijv. Wat is het belangrijkste dat je vandaag hebt geleerd?', color: 'bg-purple-600 hover:bg-purple-700', responseMode: 'TEXT' },
  PRIOR_KNOWLEDGE: { title: 'Voorkennis Ophalen', label: 'Welke voorkennis wil je activeren?', placeholder: 'Bijv. Wat weet je nog over...', color: 'bg-blue-600 hover:bg-blue-700', responseMode: 'TEXT' },
  PEER_FEEDBACK: { title: 'Peer Feedback', label: 'Wat is de opdracht voor peer feedback?', placeholder: 'Bijv. Kijk naar het werk van je buurman/buurvrouw en geef 1 top en 1 tip.', color: 'bg-teal-600 hover:bg-teal-700', responseMode: 'TEXT' },
  WHEEL_OF_NAMES: { title: 'Willekeurige Beurt', label: 'Wie is er aan de beurt?', placeholder: 'Naam van de leerling...', color: 'bg-pink-600 hover:bg-pink-700', responseMode: 'ACKNOWLEDGE' }
};
