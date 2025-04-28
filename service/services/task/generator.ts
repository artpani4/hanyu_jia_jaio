// service/services/task/generator.ts
import { AIResponse } from "$types";
import { KVWord } from "../kv/words.ts";
import { SupportedLanguage } from "$constants";
import { createAIProvider } from "../ai/factory.ts";
import luminous from "@vseplet/luminous";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("task-generator").build(),
);

export async function generateSentences(
  words: KVWord[],
  language: SupportedLanguage,
): Promise<AIResponse> {
  try {
    const aiProvider = createAIProvider();
    const sentences = await aiProvider.generateSentences(words, language);

    if (sentences.length === 0) {
      throw new Error("No sentences generated");
    }

    return {
      success: true,
      sentences,
    };
  } catch (error) {
    logger.err(`Failed to generate sentences: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
