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

// DeepSeek AI config
export const AI_CONFIG = {
  model: config.data.ai.model,
  temperature: config.data.ai.temperature,
  taskPrompt: config.data.ai.taskPrompt,
};

// Feature configuration
export const FEATURES = config.data.features;

// Word format configuration
export const WORD_FORMAT = config.data.wordFormat;

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
