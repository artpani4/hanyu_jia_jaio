// service/services/ai/base.ts
import { KVWord } from "../kv/words.ts";
import { SupportedLanguage } from "$constants";

export interface AIProvider {
  generateSentences(
    words: KVWord[],
    language: SupportedLanguage,
  ): Promise<string[]>;
}

export abstract class BaseAIProvider implements AIProvider {
  abstract generateSentences(
    words: KVWord[],
    language: SupportedLanguage,
  ): Promise<string[]>;

  protected createPrompt(
    words: KVWord[],
    language: SupportedLanguage,
  ): string {
    const wordList = words.map((w) => w.word).join(", ");
    return `
      Придумай 3 коротких осмысленных предложения на ${language}, используя слова: ${wordList}.
      Верни ТОЛЬКО текст на ${language}, без перевода и лишних комментариев.
      Формат: одно предложение на строку.
    `;
  }

  protected parseResponse(response: string): string[] {
    return response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
