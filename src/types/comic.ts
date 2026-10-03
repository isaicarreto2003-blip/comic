export type BalloonType = 'speech' | 'narration' | 'shout' | 'whisper' | 'thought' | 'sfx';

export type TailDirection = 'bottom' | 'top' | 'left' | 'right' | 'none';

export type NoirFilterType = 
  | 'classic-noir'      // Stark black and white chiaroscuro
  | 'blood-accent'       // B&W with dramatic crimson red highlights
  | 'golden-divine'     // Chiaroscuro with warm divine gold radiance
  | 'parchment-sepia'   // Ancient gritty biblical parchment sepia
  | 'emerald-shadow';   // Dark moody emerald ink wash

export interface SpeechBalloon {
  id: string;
  type: BalloonType;
  text: string;
  x: number; // percentage of page (0 to 100)
  y: number; // percentage of page (0 to 100)
  width?: number; // optional width override in %
  fontFamily: string;
  fontSize: number; // px
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  tailDirection: TailDirection;
  tailOffset?: number; // -50 to 50 %
  isBold?: boolean;
  isItalic?: boolean;
  isUppercase?: boolean;
  rotation?: number; // degrees (mainly for SFX)
}

export interface ComicPanel {
  id: string;
  imageUrl: string;
  altText: string;
  promptDescription?: string;
  aspectRatio?: string;
  zoom?: number;
  filterIntensity?: number;
}

export type PageLayoutTemplate =
  | 'splash-single'        // 1 full page epic splash
  | 'cinematic-widescreen' // 2 horizontal widescreen panels
  | 'triptych-heroic'      // 3 horizontal cinematic panels
  | 'classic-four'         // 2x2 classic grid
  | 'action-five'          // 1 large top hero + 2x2 bottom
  | 'noir-six'             // 3 rows x 2 columns
  | 'epic-inset';          // 1 giant full bleed panel + 2 floating inset panels

export interface ComicPage {
  id: string;
  pageNumber: number;
  title: string;
  chapter: string;
  bibleVerse: string;
  scriptNotes?: string;
  template: PageLayoutTemplate;
  noirFilter: NoirFilterType;
  filterIntensity: number; // 0 to 100
  gutterSize: number; // px
  borderWidth: number; // px
  borderColor: string;
  panels: ComicPanel[];
  balloons: SpeechBalloon[];
}

export interface FontOption {
  id: string;
  name: string;
  fontFamily: string;
  category: 'comic' | 'cinematic' | 'typewriter' | 'ancient' | 'impact';
  description: string;
  bestFor: string;
  sampleText: string;
}

export interface BiblicalScenePreset {
  id: string;
  title: string;
  chapter: string;
  passage: string;
  character: string;
  summary: string;
  narrationPrompt: string;
  characterQuote: string;
  soundEffect: string;
  defaultImage: string;
  template: PageLayoutTemplate;
  suggestedFilter: NoirFilterType;
}
