// config/mod.ts
import Tuner from "@artpani/tuner";
import { BaseCFGType } from "$config";
import { SupportedLanguage } from "../types.ts";

// Load appropriate config based on environment
const configName = Deno.env.get("CONFIG") || "dev";
export const config = await Tuner.use.loadConfig<BaseCFGType>();

// Environment variables
export const ENV = {
  TG_BOT_TOKEN: config.env.TG_BOT_TOKEN,
  DEEPSEEK_API_KEY: config.env.DEEPSEEK_API_KEY,
  SUPABASE_URL: config.env.SUPABASE_URL,
  SUPABASE_KEY: config.env.SUPABASE_KEY,
  SUPABASE_SCHEMA: config.env.SUPABASE_SCHEMA || "public",
  WEBHOOK_URL: config.env.WEBHOOK_URL,
  PORT: config.env.PORT || "8000",
  ADMIN_ID: config.env.ADMIN_ID,
};

// Check required environment variables
export function validateEnv() {
  const required = [
    "TG_BOT_TOKEN",
    "DEEPSEEK_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "WEBHOOK_URL",
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
    You are a language learning assistant for Chinese.
    Create 3-5 meaningful sentences or phrases in ${language} using the following Chinese words: ${
    words.join(", ")
  }.
    
    Important guidelines:
    1. If words can be logically combined into a coherent sentence, please do so.
    2. If certain words don't fit well together, it's better to create separate phrases for those words.
    3. Don't force all words into a single sentence if it doesn't make sense.
    4. Create natural, useful sentences that a language learner would benefit from.
    5. Try to keep sentences relatively simple and practical.
    
    Return ONLY the sentences/phrases in ${language}, with no translations or additional comments.
    Format: one sentence or phrase per line.
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
