// service/services/ai/factory.ts
import { AIProvider } from "./base.ts";
import { OpenAIProvider } from "./openai.ts";
import { GeminiProvider } from "./gemini.ts";
import { DeepSeekProvider } from "./deepseek.ts";
import { config } from "$shared";
import { AI_PROVIDERS } from "$constants";
import luminous from "@vseplet/luminous";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("ai-factory").build(),
);

export function createAIProvider(provider?: string): AIProvider {
  const selectedProvider = provider || config.env.DEFAULT_AI_PROVIDER;

  logger.inf(`Создаю провайдер ИИ: ${selectedProvider}`);

  // Проверка доступности ключей для выбранного провайдера
  switch (selectedProvider) {
    case AI_PROVIDERS.OPENAI:
      if (!config.env.OPENAI_API_KEY) {
        logger.wrn("OpenAI API ключ не найден, пробую DeepSeek");
        if (config.env.DEEPSEEK_API_KEY) {
          logger.inf("Использую DeepSeek вместо OpenAI");
          return new DeepSeekProvider();
        }
        if (config.env.GEMINI_API_KEY) {
          logger.inf("Использую Gemini вместо OpenAI");
          return new GeminiProvider();
        }
        logger.err("Нет доступных API ключей!");
        throw new Error("No AI API keys available");
      }
      logger.dbg("Возвращаю OpenAI провайдер");
      return new OpenAIProvider();

    case AI_PROVIDERS.GEMINI:
      if (!config.env.GEMINI_API_KEY) {
        logger.wrn("Gemini API ключ не найден, пробую DeepSeek");
        if (config.env.DEEPSEEK_API_KEY) {
          logger.inf("Использую DeepSeek вместо Gemini");
          return new DeepSeekProvider();
        }
        if (config.env.OPENAI_API_KEY) {
          logger.inf("Использую OpenAI вместо Gemini");
          return new OpenAIProvider();
        }
        logger.err("Нет доступных API ключей!");
        throw new Error("No AI API keys available");
      }
      logger.dbg("Возвращаю Gemini провайдер");
      return new GeminiProvider();

    case AI_PROVIDERS.DEEPSEEK:
      if (!config.env.DEEPSEEK_API_KEY) {
        logger.wrn("DeepSeek API ключ не найден, пробую другие провайдеры");
        if (config.env.OPENAI_API_KEY) {
          logger.inf("Использую OpenAI вместо DeepSeek");
          return new OpenAIProvider();
        }
        if (config.env.GEMINI_API_KEY) {
          logger.inf("Использую Gemini вместо DeepSeek");
          return new GeminiProvider();
        }
        logger.err("Нет доступных API ключей!");
        throw new Error("No AI API keys available");
      }
      logger.dbg("Возвращаю DeepSeek провайдер");
      return new DeepSeekProvider();

    default:
      // Если провайдер неизвестен, пробуем использовать первый доступный
      logger.wrn(
        `Неизвестный провайдер ${selectedProvider}, ищу доступные ключи`,
      );
      if (config.env.DEEPSEEK_API_KEY) {
        logger.inf("Использую DeepSeek по умолчанию");
        return new DeepSeekProvider();
      }
      if (config.env.OPENAI_API_KEY) {
        logger.inf("Использую OpenAI по умолчанию");
        return new OpenAIProvider();
      }
      if (config.env.GEMINI_API_KEY) {
        logger.inf("Использую Gemini по умолчанию");
        return new GeminiProvider();
      }

      logger.err("Нет доступных API ключей!");
      throw new Error("No AI API keys available");
  }
}
