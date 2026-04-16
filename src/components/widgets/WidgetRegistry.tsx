import React from 'react';
import { Clock, Timer, AlertCircle, Volume2, Users, Dices, QrCode, Type, Edit3, MessageCircle, Calendar, Calculator, BarChart3, Image as ImageIcon, Video, Play, CloudRain, Music, CheckSquare, Quote, BookOpen, Smile, ListTodo, Headphones, BrainCircuit, Sparkles, Languages, HelpCircle, FileText, Activity } from 'lucide-react';

export type WidgetType = 
  | 'CLOCK' | 'TIMER' | 'TRAFFIC_LIGHT' | 'NOISE_LEVEL' | 'RANDOM_NAME' 
  | 'DICE' | 'QR_CODE' | 'TEXT_NOTE' | 'WHITEBOARD' | 'WORK_SYMBOLS' 
  | 'CALENDAR' | 'CALCULATOR' | 'POLL' | 'GROUP_MAKER' | 'IMAGE' 
  | 'VIDEO' | 'STOPWATCH' | 'WEATHER' | 'SOUNDBOARD' | 'EXIT_TICKET' 
  | 'EAI_FEEDBACK' | 'EAI_SUMMARY' | 'EAI_QUIZ' | 'EAI_EXPLAINER' | 'EAI_TRANSLATOR' 
  | 'DAILY_QUOTE' | 'WORD_OF_DAY' | 'EMOJI_METER' | 'TODO_LIST' | 'BGM' | 'LESSON_PLAN';

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  icon: React.ElementType;
  description: string;
  category: 'TOOLS' | 'MEDIA' | 'EAI' | 'CLASS_MANAGEMENT';
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  { type: 'CLOCK', name: 'Klok', icon: Clock, description: 'Toon de huidige tijd', category: 'TOOLS' },
  { type: 'TIMER', name: 'Timer', icon: Timer, description: 'Stel een afteltimer in', category: 'TOOLS' },
  { type: 'TRAFFIC_LIGHT', name: 'Stoplicht', icon: AlertCircle, description: 'Regel de activiteit', category: 'CLASS_MANAGEMENT' },
  { type: 'NOISE_LEVEL', name: 'Geluidsniveau', icon: Volume2, description: 'Meet het geluid in de klas', category: 'CLASS_MANAGEMENT' },
  { type: 'RANDOM_NAME', name: 'Namenkiezer', icon: Users, description: 'Kies willekeurig een leerling', category: 'TOOLS' },
  { type: 'DICE', name: 'Dobbelsteen', icon: Dices, description: 'Rol een of meer dobbelstenen', category: 'TOOLS' },
  { type: 'QR_CODE', name: 'QR Code', icon: QrCode, description: 'Deel een link via QR', category: 'MEDIA' },
  { type: 'TEXT_NOTE', name: 'Tekstvak', icon: Type, description: 'Schrijf een notitie op het bord', category: 'TOOLS' },
  { type: 'WHITEBOARD', name: 'Tekenen', icon: Edit3, description: 'Vrij tekenen op het bord', category: 'TOOLS' },
  { type: 'WORK_SYMBOLS', name: 'Werkvormen', icon: MessageCircle, description: 'Toon de huidige werkvorm', category: 'CLASS_MANAGEMENT' },
  { type: 'CALENDAR', name: 'Kalender', icon: Calendar, description: 'Toon de datum en afspraken', category: 'TOOLS' },
  { type: 'CALCULATOR', name: 'Rekenmachine', icon: Calculator, description: 'Eenvoudige rekenmachine', category: 'TOOLS' },
  { type: 'POLL', name: 'Peiling', icon: BarChart3, description: 'Stel een snelle vraag', category: 'CLASS_MANAGEMENT' },
  { type: 'GROUP_MAKER', name: 'Groepjesmaker', icon: Users, description: 'Maak willekeurige groepjes', category: 'CLASS_MANAGEMENT' },
  { type: 'IMAGE', name: 'Afbeelding', icon: ImageIcon, description: 'Toon een afbeelding', category: 'MEDIA' },
  { type: 'VIDEO', name: 'Video', icon: Video, description: 'Speel een video af', category: 'MEDIA' },
  { type: 'STOPWATCH', name: 'Stopwatch', icon: Play, description: 'Meet de tijd', category: 'TOOLS' },
  { type: 'WEATHER', name: 'Weer', icon: CloudRain, description: 'Toon de weersverwachting', category: 'TOOLS' },
  { type: 'SOUNDBOARD', name: 'Geluidenbord', icon: Music, description: 'Speel effecten af', category: 'MEDIA' },
  { type: 'EXIT_TICKET', name: 'Exit Ticket', icon: CheckSquare, description: 'Snelle check aan het eind', category: 'CLASS_MANAGEMENT' },
  { type: 'EAI_FEEDBACK', name: 'EAI Feedback', icon: BrainCircuit, description: 'AI analyseert de klas', category: 'EAI' },
  { type: 'EAI_SUMMARY', name: 'EAI Samenvatting', icon: FileText, description: 'AI vat de les samen', category: 'EAI' },
  { type: 'EAI_QUIZ', name: 'EAI Quiz', icon: Sparkles, description: 'Genereer een snelle quiz', category: 'EAI' },
  { type: 'EAI_EXPLAINER', name: 'EAI Uitleg', icon: HelpCircle, description: 'AI legt een concept uit', category: 'EAI' },
  { type: 'EAI_TRANSLATOR', name: 'EAI Vertaler', icon: Languages, description: 'Vertaal tekst direct', category: 'EAI' },
  { type: 'DAILY_QUOTE', name: 'Citaat', icon: Quote, description: 'Inspirerende quote', category: 'MEDIA' },
  { type: 'WORD_OF_DAY', name: 'Woord v/d Dag', icon: BookOpen, description: 'Leer een nieuw woord', category: 'MEDIA' },
  { type: 'EMOJI_METER', name: 'Emoji Meter', icon: Smile, description: 'Hoe voelt de klas zich?', category: 'CLASS_MANAGEMENT' },
  { type: 'TODO_LIST', name: 'Takenlijst', icon: ListTodo, description: 'Lijst met taken voor de les', category: 'TOOLS' },
  { type: 'BGM', name: 'Achtergrondmuziek', icon: Headphones, description: 'Rustgevende muziek', category: 'MEDIA' },
  { type: 'LESSON_PLAN', name: 'Lesplan', icon: FileText, description: 'Toon lesdoelen en notities', category: 'CLASS_MANAGEMENT' },
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
