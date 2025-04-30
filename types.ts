// types.ts

// Supported languages
export const SUPPORTED_LANGUAGES = [
  "ru",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "zh",
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// User data model (for Supabase)
export interface User {
  id: string; // uuid
  telegram_id: number;
  username: string | null;
  language: SupportedLanguage;
  created_at?: string;
  updated_at?: string;
}

// User data model (for KV storage)
export interface KVUser {
  telegram_id: number;
  username: string | null;
  language: SupportedLanguage;
  created_at: string;
  updated_at: string;
}

// Word data model
export interface WordData {
  word: string; // The word in original language
  pinyin: string; // Pinyin pronunciation
  hanzi: string; // Chinese character
  translation: string; // Translation
}

// KV storage word model
export interface KVWord extends WordData {
  id: string;
  times_used: number;
  last_used_at?: string;
}

// AI response model
export interface AIResponse {
  success: boolean;
  sentences?: string[];
  error?: string;
}
