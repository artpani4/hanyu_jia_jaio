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
你是一个中文学习助手。

请用下列中文词语：${
    words.join("，")
  }，写出三到五个简单、自然、实用的中文句子，每句占一行，不要编号，也不要加标题。

然后在新的一行写：---

接着写出对应的${
    language === "ru" ? "俄语" : language
  }翻译，每句一行，顺序对应上面中文句子。不要编号，也不要加标题。

示例：
我喜欢学习中文。
我们一起去吃饭吧。
---
Мне нравится учить китайский.
Пойдём поедим вместе.
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

export const WORD_FORMAT = {
  separator: "|",
  exampleFormat:
    "иероглиф | пиньинь | перевод — или: иероглиф | перевод — или просто иероглиф",
  example: "你好 | nǐ hǎo | привет",
};
