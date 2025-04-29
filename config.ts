// config.ts
import { SupportedLanguage } from "./types.ts";

// Environment variables
export const ENV = {
  TG_BOT_TOKEN: Deno.env.get("TG_BOT_TOKEN") || "",
  DEEPSEEK_API_KEY: Deno.env.get("DEEPSEEK_API_KEY") || "",
  SUPABASE_URL: Deno.env.get("SUPABASE_URL") || "",
  SUPABASE_KEY: Deno.env.get("SUPABASE_KEY") || "",
  SUPABASE_SCHEMA: Deno.env.get("SUPABASE_SCHEMA") || "public",
};

// Check required environment variables
export function validateEnv() {
  const required = [
    "TG_BOT_TOKEN",
    "DEEPSEEK_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_KEY",
  ];
  const missing = required.filter((key) => !ENV[key as keyof typeof ENV]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

// DeepSeek AI config
export const AI_CONFIG = {
  model: "deepseek-chat",
  temperature: 0.7,
  taskPrompt: (words: string[], language: SupportedLanguage) => `
    Придумай 3 коротких осмысленных предложения на ${language}, используя слова: ${
    words.join(", ")
  }.
    Верни ТОЛЬКО текст на ${language}, без перевода и лишних комментариев.
    Формат: одно предложение на строку.
  `,
};

// Feature configuration
export const FEATURES = {
  tasks: {
    defaultWordCount: 10,
    minWordCount: 5,
    maxWordCount: 20,
  },
};

// Word format configuration
export const WORD_FORMAT = {
  separator: "|",
  exampleFormat: "слово|пиньинь|иероглиф|перевод",
  example: "hello|nǐ hǎo|你好|привет",
};
