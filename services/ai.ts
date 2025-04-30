// services/ai.ts
import { OpenAI } from "https://esm.sh/openai@4.20.1";
import { AIResponse, KVWord, SupportedLanguage } from "../types.ts";
import { logger } from "../utils/logger.ts";
import { AI_CONFIG, ENV } from "../config/mod.ts";

const openai = new OpenAI({
  apiKey: ENV.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export const aiService = {
  async generateSentences(
    words: KVWord[],
    language: SupportedLanguage,
  ): Promise<AIResponse> {
    try {
      logger.info(
        `🔤 Generating sentences using ${words.length} words in ${language}`,
      );

      const wordTexts = words.map((w) => w.word);
      //@ts-ignore
      const prompt = (AI_CONFIG.taskPrompt(wordTexts, language)) as string;

      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: AI_CONFIG.temperature,
      });

      const responseText = completion.choices[0]?.message?.content ?? "";
      logger.info("📨 Raw DeepSeek response:\n" + responseText);

      const { chinese, translated } = this.parseResponse(responseText);

      logger.info(
        `🇨🇳 Parsed Chinese (${chinese.length} lines):\n` + chinese.join("\n"),
      );
      logger.info(
        `🌍 Parsed Translations (${translated.length} lines):\n` +
          translated.join("\n"),
      );

      if (chinese.length === 0 || translated.length === 0) {
        throw new Error("No valid sentences returned");
      }

      const sentences = translated.map((t, i) =>
        `${t} || ${chinese[i] ?? "-"}`
      );

      logger.info(
        `✅ Successfully generated ${sentences.length} sentence pairs`,
      );
      return {
        success: true,
        sentences,
      };
    } catch (error) {
      logger.error(
        `❌ Error generating sentences: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  parseResponse(response: string): {
    chinese: string[];
    translated: string[];
  } {
    const sections = response.split(/\n\s*-{3,}\s*\n/);

    if (sections.length < 2) {
      logger.warn("⚠️ Could not split response on separator (---)");
    }

    const [rawChinese = "", rawTranslated = ""] = sections;

    const clean = (text: string) =>
      text
        .split("\n")
        .map((l) => l.replace(/^\d+\.?\s*/, "").trim())
        .filter((l) => l.length > 0);

    return {
      chinese: clean(rawChinese),
      translated: clean(rawTranslated),
    };
  },
};
