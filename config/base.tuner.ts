// config/base.tuner.ts
import Tuner from "@artpani/tuner";

const baseCfg = Tuner.tune({
  env: {
    // Основные переменные окружения
    SUPABASE_URL: Tuner.Env.getString.orThrow(
      new Error("Missing SUPABASE_URL"),
    ),
    SUPABASE_KEY: Tuner.Env.getString.orThrow(
      new Error("Missing SUPABASE_KEY"),
    ),
    TG_BOT_TOKEN: Tuner.Env.getString.orThrow(
      new Error("Missing TG_BOT_TOKEN"),
    ),
    WEBHOOK_URL: Tuner.Env.getString.orThrow(new Error("Missing WEBHOOK_URL")),

    // AI провайдеры
    OPENAI_API_KEY: Tuner.Env.getString.orDefault(""),
    GEMINI_API_KEY: Tuner.Env.getString.orDefault(""),
    DEEPSEEK_API_KEY: Tuner.Env.getString.orDefault(""),
    DEFAULT_AI_PROVIDER: Tuner.Env.getString.orDefault("deepseek"),

    // База данных
    SUPABASE_SCHEMA: Tuner.Env.getString.orDefault("dev"),
  },
  data: {
    features: {
      ai: {
        providers: {
          openai: {
            enabled: true,
            model: "gpt-4o",
          },
          gemini: {
            enabled: true,
            model: "gemini-1.5-flash",
          },
          deepseek: {
            enabled: true,
            model: "deepseek-chat",
          },
        },
      },
      tasks: {
        defaultWordCount: 10,
        minWordCount: 5,
        maxWordCount: 20,
      },
    },
    prompts: {
      taskGeneration: `
        Придумай 3 коротких осмысленных предложения на {userLanguage}, используя слова: {words}.
        Верни ТОЛЬКО текст на {userLanguage}, без перевода и лишних комментариев.
        Формат: одно предложение на строку.
      `,
    },
  },
});

export default baseCfg;
export type BaseCfgType = typeof baseCfg;
