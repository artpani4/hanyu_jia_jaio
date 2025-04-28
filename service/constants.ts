// service/constants.ts
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

export const IMPORT_TYPES = {
  TEXT: "text",
  CSV: "csv",
  GOOGLE_SHEET: "google_sheet",
  NOTION: "notion",
} as const;

export const AI_PROVIDERS = {
  OPENAI: "openai",
  GEMINI: "gemini",
  DEEPSEEK: "deepseek",
} as const;

export const IMPORT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// service/constants.ts (обновить DEFAULT_WORD_FORMAT)
export const DEFAULT_WORD_FORMAT = {
  separator: "|",
  patterns: [
    "hanzi|pinyin|translation", // Новый трехчастный формат
    "word|pinyin|hanzi|translation", // Старый четырехчастный формат
  ],
  examples: [
    "你好|nǐ hǎo|привет",
    "hello|nǐ hǎo|你好|привет",
  ],
};
