import React from 'react';
import { 
  Clock, Timer, AlertCircle, Users, Type, 
  MonitorPlay, FileText, HelpCircle, Box, 
  BarChart3, ArrowRightCircle, SplitSquareHorizontal 
} from 'lucide-react';

export type WidgetType = 
  | 'CLOCK' | 'TIMER' | 'TRAFFIC_LIGHT' | 'RANDOM_NAME' 
  | 'TEXT_NOTE' | 'MEDIA_VIEWER' | 'LESSON_PLAN'
  | 'EAI_EXPLAINER' | 'EAI_QUIZ' | 'EAI_SUMMARY' | 'EAI_FEEDFORWARD' | 'EAI_DIFFERENTIATION';

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  icon: React.ElementType;
  description: string;
  category: 'TOOLS' | 'MEDIA' | 'EAI' | 'CLASS_MANAGEMENT';
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  // --- TIER 1: DUMB TOOLS (Local/Classroom Management) ---
  { type: 'CLOCK', name: 'Klok', icon: Clock, description: 'Toon de huidige tijd groot en duidelijk op het digibord.', category: 'TOOLS' },
  { type: 'TIMER', name: 'Timer', icon: Timer, description: 'Stel een zichtbare afteltimer in voor een actieve taak of leessessie.', category: 'TOOLS' },
  { type: 'TRAFFIC_LIGHT', name: 'Stoplicht', icon: AlertCircle, description: 'Kleurrijk stoplicht (Rood/Oranje/Groen) voor regie op groepsdynamiek en geluid.', category: 'CLASS_MANAGEMENT' },
  { type: 'RANDOM_NAME', name: 'Namenkiezer', icon: Users, description: 'Kies transparant en willekeurig een leerling voor een beurt.', category: 'CLASS_MANAGEMENT' },
  { type: 'TEXT_NOTE', name: 'Tekstvak', icon: Type, description: 'Plaats een vrij tekstvak voor snelle notities, huiswerk of mededelingen.', category: 'TOOLS' },
  { type: 'MEDIA_VIEWER', name: 'Media Speler', icon: MonitorPlay, description: 'Toon ondersteunende visuele media zoals YouTube of afbeeldingen.', category: 'MEDIA' },
  { type: 'LESSON_PLAN', name: 'Lesdoel', icon: FileText, description: 'Toon prominent het leerdoel en de verwachte succescriteria van vandaag.', category: 'CLASS_MANAGEMENT' },

  // --- TIER 2: SMART EAI TOOLS (SSOT 16.2 Backed) ---
  { type: 'EAI_SUMMARY', name: 'EAI Signalen', icon: BarChart3, description: 'Real-time AI cluster overzicht van leerlingsignalen en actuele knelpunten.', category: 'EAI' },
  { type: 'EAI_EXPLAINER', name: 'EAI Uitleg (Beeld)', icon: HelpCircle, description: 'Genereer didactische metaforen of simplificaties voor complexe lesstof.', category: 'EAI' },
  { type: 'EAI_QUIZ', name: 'EAI Quiz', icon: Box, description: 'Genereer formatieve checkvragen 100% toegespitst op de specifieke klas.', category: 'EAI' },
  { type: 'EAI_DIFFERENTIATION', name: 'Verlengde Instructie', icon: SplitSquareHorizontal, description: 'AI selecteert leerlingen voor extra begeleiding op basis van live data-input.', category: 'EAI' },
  { type: 'EAI_FEEDFORWARD', name: 'EAI Feedforward', icon: ArrowRightCircle, description: 'Verzamel evaluatiedata voor een gerichte transfer in de startfase van de volgende les.', category: 'EAI' }
];

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
  data: any;
}

