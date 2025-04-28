// service/services/ai/openai.ts
import { BaseAIProvider } from "./base.ts";
import { KVWord } from "../kv/words.ts";
import { SupportedLanguage } from "$constants";
import { config } from "$shared";
import { OpenAI } from "openai";

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: config.env.OPENAI_API_KEY,
    });
  }

  async generateSentences(
    words: KVWord[],
    language: SupportedLanguage,
  ): Promise<string[]> {
    const prompt = this.createPrompt(words, language);

    const completion = await this.client.chat.completions.create({
      model: config.data.features.ai.providers.openai.model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content ?? "";
    return this.parseResponse(response);
  }
}
