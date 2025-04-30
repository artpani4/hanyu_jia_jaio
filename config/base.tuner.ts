import Tuner from "@artpani/tuner";
import { SupportedLanguage } from "../types.ts";

const baseCfg = Tuner.tune({
  env: {
    TG_BOT_TOKEN: Tuner.Env.getString.orExit("Telegram bot token is required"),
    DEEPSEEK_API_KEY: Tuner.Env.getString.orExit(
      "DeepSeek API key is required",
    ),
    SUPABASE_URL: Tuner.Env.getString.orExit("Supabase URL is required"),
    SUPABASE_KEY: Tuner.Env.getString.orExit("Supabase key is required"),
    SUPABASE_SCHEMA: Tuner.Env.getString.orDefault("public"),
    WEBHOOK_URL: Tuner.Env.getString.orNothing(),
    PORT: Tuner.Env.getString.orDefault("8000"),
    ADMIN_ID: Tuner.Env.getString.orNothing(),
  },
  data: {
    logLevel: "info",
    appName: "Chinese Learning Bot",
    version: "1.0.0",
    ai: {
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
    },
    features: {
      tasks: {
        defaultWordCount: 10,
        minWordCount: 5,
        maxWordCount: 20,
      },
    },
    wordFormat: {
      separator: "|",
      exampleFormat:
        "иероглиф | пиньинь | перевод — или: иероглиф | перевод — или просто иероглиф",
      example: "你好 | nǐ hǎo | привет",
    },
  },
});

export default baseCfg;
export type BaseCFGType = typeof baseCfg;
