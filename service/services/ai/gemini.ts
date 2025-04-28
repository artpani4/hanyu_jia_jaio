// service/services/ai/gemini.ts
import { BaseAIProvider } from "./base.ts";
import { KVWord } from "../kv/words.ts";
import { SupportedLanguage } from "$constants";
import { config } from "$shared";

export class GeminiProvider extends BaseAIProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = config.env.GEMINI_API_KEY;
    this.model = config.data.features.ai.providers.gemini.model;
  }

  async generateSentences(
    words: KVWord[],
    language: SupportedLanguage,
  ): Promise<string[]> {
    const prompt = this.createPrompt(words, language);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return this.parseResponse(text);
  }
}
