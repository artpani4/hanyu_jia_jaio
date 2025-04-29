// services/ai.ts
import { OpenAI } from "https://esm.sh/openai@4.20.1";
import { AIResponse, KVWord, SupportedLanguage } from "../types.ts";
import { AI_CONFIG, ENV } from "../config.ts";
import { logger } from "../utils/logger.ts";

// Initialize OpenAI client (used for DeepSeek)
const openai = new OpenAI({
  apiKey: ENV.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com", // DeepSeek API endpoint
});

// AI service for sentence generation
export const aiService = {
  // Generate sentences using DeepSeek
  async generateSentences(
    words: KVWord[],
    language: SupportedLanguage,
  ): Promise<AIResponse> {
    try {
      logger.info(
        `Generating sentences with ${words.length} words in ${language}`,
      );

      // Extract just the word text for the prompt
      const wordTexts = words.map((w) => w.word);

      // Create prompt from configuration
      const prompt = AI_CONFIG.taskPrompt(wordTexts, language);

      // Call DeepSeek API
      const completion = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: AI_CONFIG.temperature,
      });

      // Extract the response text
      const responseText = completion.choices[0]?.message?.content ?? "";

      // Parse the response into separate sentences
      const sentences = this.parseResponse(responseText);

      if (sentences.length === 0) {
        throw new Error("No sentences generated");
      }

      logger.info(`Successfully generated ${sentences.length} sentences`);
      return {
        success: true,
        sentences,
      };
    } catch (error) {
      logger.error(
        `Error generating sentences: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },

  // Parse the response from DeepSeek into sentences
  parseResponse(response: string): string[] {
    return response
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  },
};
