export interface ScanRecord {
  id?: number;
  timestamp: number;
  originalImage: string; // Base64
  extractedText: string;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  HIGH_CONTRAST = 'high_contrast', // Yellow text on Black
  INVERTED = 'inverted', // Black text on Yellow
}

export interface AppSettings {
  fontSize: number; // in pixels
  theme: ThemeMode;
}

export type ViewState = 'HOME' | 'SCAN_RESULT' | 'HISTORY' | 'SETTINGS';
