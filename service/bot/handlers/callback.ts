// service/bot/handlers/callback.ts
import { Bot } from "@grammy";
import luminous from "@vseplet/luminous";
import { getString } from "$strings";
import { db } from "$db";
import { mainKeyboard } from "../keyboards/main.ts";
import { importOptionsKeyboard } from "../keyboards/import.ts";
import { config } from "$shared";
import { createAIProvider } from "../../services/ai/factory.ts";
import { SupportedLanguage } from "$constants";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("callback").build(),
);

// Set для отслеживания обработанных callback_query_id
// Храним только последние 100 ID чтобы избежать утечки памяти
const processedCallbackIds = new Set<string>();
const MAX_PROCESSED_IDS = 100;

// Функция добавления ID в множество с ограничением размера
function addProcessedId(id: string) {
  processedCallbackIds.add(id);

  // Если достигли лимита, удаляем самый старый ID
  if (processedCallbackIds.size > MAX_PROCESSED_IDS) {
    const firstId = processedCallbackIds.values().next().value;
    processedCallbackIds.delete(firstId);
  }
}

export function bindCallbackHandlers(bot: Bot) {
  // Выбор языка
  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    // Проверяем, был ли этот callback уже обработан
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.dbg(`Дубликат callback запроса (язык): ${callbackId}, игнорируем`);
      await ctx.answerCallbackQuery();
      return;
    }

    // Отмечаем callback как обработанный
    addProcessedId(callbackId);

    const selectedLang = ctx.match![1] as SupportedLanguage;
    const userId = ctx.from!.id;

    try {
      const [updatedUser, err] = await db.user.updateUserLanguage(
        userId,
        selectedLang,
      );

      if (err) {
        logger.err(`Ошибка обновления языка: ${err.message}`);
        await ctx.answerCallbackQuery("❌ Ошибка при смене языка");
        return;
      }

      await ctx.editMessageText(getString(selectedLang, "LANG_SELECTED"));
      await ctx.reply(getString(selectedLang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: importOptionsKeyboard(),
      });

      await ctx.answerCallbackQuery();
    } catch (e) {
      logger.err(`Ошибка в выборе языка: ${(e as Error).message}`);
      await ctx.answerCallbackQuery("❌ Ошибка");
    }
  });

  // Импорт способов
  bot.callbackQuery("import_text", async (ctx) => {
    // Проверяем, был ли этот callback уже обработан
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.dbg(
        `Дубликат callback запроса (import_text): ${callbackId}, игнорируем`,
      );
      await ctx.answerCallbackQuery();
      return;
    }

    // Отмечаем callback как обработанный
    addProcessedId(callbackId);

    await ctx.reply(
      "✍️ Просто отправьте текст в формате: слово|пиньинь|иероглиф|перевод",
    );
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("import_csv", async (ctx) => {
    // Проверяем, был ли этот callback уже обработан
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.dbg(
        `Дубликат callback запроса (import_csv): ${callbackId}, игнорируем`,
      );
      await ctx.answerCallbackQuery();
      return;
    }

    // Отмечаем callback как обработанный
    addProcessedId(callbackId);

    await ctx.reply("📁 Пожалуйста, отправьте CSV-файл с вашими словами.");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("import_gsheet", async (ctx) => {
    // Проверяем, был ли этот callback уже обработан
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.dbg(
        `Дубликат callback запроса (import_gsheet): ${callbackId}, игнорируем`,
      );
      await ctx.answerCallbackQuery();
      return;
    }

    // Отмечаем callback как обработанный
    addProcessedId(callbackId);

    await ctx.reply("🔗 Отправьте ссылку на Google Sheets.");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("import_notion", async (ctx) => {
    // Проверяем, был ли этот callback уже обработан
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.dbg(
        `Дубликат callback запроса (import_notion): ${callbackId}, игнорируем`,
      );
      await ctx.answerCallbackQuery();
      return;
    }

    // Отмечаем callback как обработанный
    addProcessedId(callbackId);

    await ctx.reply("🔗 Отправьте ссылку на базу Notion.");
    await ctx.answerCallbackQuery();
  });

  // Получить задание
  bot.callbackQuery("get_task", async (ctx) => {
    // Проверяем, был ли этот callback уже обработан
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.dbg(
        `Дубликат callback запроса (get_task): ${callbackId}, игнорируем`,
      );
      await ctx.answerCallbackQuery();
      return;
    }

    logger.inf(`Обработка запроса задания, ID: ${callbackId}`);

    // Отмечаем callback как обработанный
    addProcessedId(callbackId);

    const userId = ctx.from!.id;

    try {
      // Сразу отвечаем на callback запрос
      await ctx.answerCallbackQuery();

      const [user] = await db.user.getUserByTelegramId(userId);
      if (!user) {
        await ctx.reply("❌ Пользователь не найден");
        return;
      }

      const lang = user.language as SupportedLanguage ?? "en";
      const wordCount = await db.word.getUserWordCount(user.id);

      if (wordCount === 0) {
        await ctx.reply(getString(lang, "NO_WORDS_ERROR"));
        return;
      }

      const words = await db.word.getLeastUsedWords(
        user.id,
        config.data.features.tasks.defaultWordCount,
      );

      try {
        const aiProvider = createAIProvider();
        logger.inf(
          `Запрос задания для пользователя ${userId}, используя DeepSeek`,
        );
        const sentences = await aiProvider.generateSentences(words, lang);
        logger.inf(`Получены предложения для задания: ${sentences.length}`);

        if (sentences.length === 0) {
          throw new Error("No sentences generated");
        }

        const wordIds = words.map((w) => w.id);
        await db.word.updateWordsUsage(user.id, wordIds);
        logger.dbg(
          `Обновлена статистика использования для ${wordIds.length} слов`,
        );

        const taskMessage = [
          getString(lang, "TASK_PROMPT"),
          "",
          ...sentences.map((s, i) => `${i + 1}. ${s}`),
        ].join("\n");

        await ctx.reply(taskMessage, {
          reply_markup: mainKeyboard(lang),
        });
        logger.inf(`Задание успешно отправлено пользователю ${userId}`);
      } catch (error) {
        logger.err(`Ошибка с AI провайдером: ${(error as Error).message}`);
        await ctx.reply(getString(lang, "TASK_GENERATION_ERROR"), {
          reply_markup: mainKeyboard(lang),
        });
      }
    } catch (e) {
      logger.err(`Ошибка при получении задания: ${(e as Error).message}`);
      await ctx.reply("❌ Ошибка при получении задания");
    }
  });
}
