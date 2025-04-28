// service/bot/handlers/message.ts
import { Bot } from "@grammy";
import luminous from "@vseplet/luminous";
import { db } from "$db";
import { SupportedLanguage } from "$constants";
import { getString } from "$strings";
import { mainKeyboard } from "../keyboards/main.ts";
import { TextParser } from "../../services/import/text.ts";
import { CSVParser } from "../../services/import/csv.ts";
import { GoogleSheetParser } from "../../services/import/gsheet.ts";
import { NotionParser } from "../../services/import/notion.ts";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("message-handler").build(),
);

function isGoogleSheetUrl(url: string): boolean {
  return url.includes("docs.google.com/spreadsheets/");
}

function isNotionUrl(url: string): boolean {
  return url.includes("notion.so/");
}

export function bindMessageHandlers(bot: Bot) {
  // Обработка текстовых сообщений
  bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    logger.inf(
      `Получено текстовое сообщение от пользователя ${userId}: ${
        text.substring(0, 50)
      }${text.length > 50 ? "..." : ""}`,
    );

    // Получаем пользователя для определения языка
    const [user, userErr] = await db.user.getUserByTelegramId(userId);
    if (userErr || !user) {
      logger.err(
        `Ошибка получения пользователя ${userId}: ${userErr?.message}`,
      );
      await ctx.reply("❌ Ошибка. Попробуйте выполнить /start");
      return;
    }

    const lang = user.language as SupportedLanguage;
    logger.dbg(`Пользователь ${userId}, язык: ${lang}`);

    // Проверяем, является ли текст URL на Google Sheets или Notion
    if (isGoogleSheetUrl(text)) {
      logger.inf(
        `Обнаружена ссылка на Google Sheets от пользователя ${userId}: ${text}`,
      );
      await ctx.reply("⏳ Импортирую слова из Google Sheets...");
      try {
        const parser = new GoogleSheetParser();
        logger.dbg(`Начинаю парсинг Google Sheets: ${text}`);
        const words = await parser.parse(text);
        logger.inf(
          `Результат парсинга Google Sheets: найдено ${words.length} слов`,
        );

        if (words.length === 0) {
          logger.wrn(
            `Google Sheets импорт: нет слов для пользователя ${userId}`,
          );
          await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
          return;
        }

        // Логируем первые несколько слов для отладки
        logger.dbg(
          `Примеры импортированных слов: ${JSON.stringify(words.slice(0, 3))}`,
        );

        const addedCount = await db.word.addWords(user.id, words);
        logger.inf(
          `Добавлено ${addedCount} слов в KV для пользователя ${userId}`,
        );

        await ctx.reply(
          `${getString(lang, "WORDS_ADDED")} Добавлено слов: ${addedCount}`,
          { reply_markup: mainKeyboard(lang) },
        );
      } catch (error) {
        logger.err(
          `Ошибка при импорте из Google Sheets для ${userId}: ${
            (error as Error).message
          }`,
        );
        await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
      }
      return;
    }

    if (isNotionUrl(text)) {
      logger.inf(
        `Обнаружена ссылка на Notion от пользователя ${userId}: ${text}`,
      );
      await ctx.reply("⏳ Импортирую слова из Notion...");
      try {
        const parser = new NotionParser();
        logger.dbg(`Начинаю парсинг Notion: ${text}`);
        const words = await parser.parse(text);
        logger.inf(`Результат парсинга Notion: найдено ${words.length} слов`);

        if (words.length === 0) {
          logger.wrn(`Notion импорт: нет слов для пользователя ${userId}`);
          await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
          return;
        }

        // Логируем первые несколько слов для отладки
        logger.dbg(
          `Примеры импортированных слов: ${JSON.stringify(words.slice(0, 3))}`,
        );

        const addedCount = await db.word.addWords(user.id, words);
        logger.inf(
          `Добавлено ${addedCount} слов в KV для пользователя ${userId}`,
        );

        await ctx.reply(
          `${getString(lang, "WORDS_ADDED")} Добавлено слов: ${addedCount}`,
          { reply_markup: mainKeyboard(lang) },
        );
      } catch (error) {
        logger.err(
          `Ошибка при импорте из Notion для ${userId}: ${
            (error as Error).message
          }`,
        );
        await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
      }
      return;
    }

    // Обычный текстовый ввод слов
    logger.inf(`Обрабатываю текстовый ввод слов от пользователя ${userId}`);
    try {
      const parser = new TextParser();
      logger.dbg(
        `Парсинг текста для импорта слов: ${text.substring(0, 100)}${
          text.length > 100 ? "..." : ""
        }`,
      );
      const words = await parser.parse(text);
      logger.inf(`Результат парсинга текста: найдено ${words.length} слов`);

      if (words.length === 0) {
        logger.wrn(
          `Текстовый импорт: нет слов для пользователя ${userId}. Проверка формата.`,
        );
        // Покажем ошибку с примером правильного формата для большей ясности
        await ctx.reply(
          `${
            getString(lang, "WORDS_IMPORT_ERROR")
          }\n\nПример правильного формата:\nhello|nǐ hǎo|你好|привет`,
        );
        return;
      }

      // Логируем примеры распарсенных слов
      logger.dbg(
        `Примеры импортированных слов: ${JSON.stringify(words.slice(0, 3))}`,
      );

      const addedCount = await db.word.addWords(user.id, words);
      logger.inf(
        `Добавлено ${addedCount} слов в KV для пользователя ${userId}`,
      );

      await ctx.reply(
        `${getString(lang, "WORDS_ADDED")} Добавлено слов: ${addedCount}`,
        { reply_markup: mainKeyboard(lang) },
      );
    } catch (error) {
      logger.err(
        `Ошибка при импорте текста для ${userId}: ${(error as Error).message}`,
      );
      logger.err(
        `Содержимое текста, вызвавшего ошибку: ${text.substring(0, 200)}`,
      );
      await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
    }
  });

  // Обработка файлов (CSV)
  bot.on("message:document", async (ctx) => {
    const userId = ctx.from.id;
    const fileId = ctx.message.document.file_id;
    const fileName = ctx.message.document.file_name || "неизвестный файл";

    logger.inf(
      `Получен документ от пользователя ${userId}: ${fileName} (ID: ${fileId})`,
    );

    // Получаем пользователя для определения языка
    const [user, userErr] = await db.user.getUserByTelegramId(userId);
    if (userErr || !user) {
      logger.err(
        `Ошибка получения пользователя ${userId}: ${userErr?.message}`,
      );
      await ctx.reply("❌ Ошибка. Попробуйте выполнить /start");
      return;
    }

    const lang = user.language as SupportedLanguage;
    logger.dbg(`Пользователь ${userId}, язык: ${lang}`);

    // Проверяем, что файл - CSV
    if (!fileName.toLowerCase().endsWith(".csv")) {
      logger.wrn(`Файл не CSV: ${fileName} от пользователя ${userId}`);
      await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
      return;
    }

    await ctx.reply("⏳ Импортирую слова из CSV файла...");

    try {
      // Скачиваем файл
      logger.dbg(`Скачиваю файл ${fileId} для пользователя ${userId}`);
      const file = await ctx.api.getFile(fileId);
      const fileUrl =
        `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
      logger.dbg(`URL файла: ${fileUrl}`);

      const response = await fetch(fileUrl);
      const fileData = await response.arrayBuffer();
      logger.dbg(`Файл скачан, размер: ${fileData.byteLength} байт`);

      // Парсим и добавляем слова
      const parser = new CSVParser();
      logger.dbg(`Начинаю парсинг CSV файла для ${userId}`);
      const words = await parser.parse(new Uint8Array(fileData));
      logger.inf(`Результат парсинга CSV: найдено ${words.length} слов`);

      if (words.length === 0) {
        logger.wrn(`CSV импорт: нет слов для пользователя ${userId}`);
        await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
        return;
      }

      // Логируем примеры распарсенных слов
      logger.dbg(
        `Примеры импортированных слов: ${JSON.stringify(words.slice(0, 3))}`,
      );

      const addedCount = await db.word.addWords(user.id, words);
      logger.inf(
        `Добавлено ${addedCount} слов в KV для пользователя ${userId}`,
      );

      await ctx.reply(
        `${getString(lang, "WORDS_ADDED")} Добавлено слов: ${addedCount}`,
        { reply_markup: mainKeyboard(lang) },
      );
    } catch (error) {
      logger.err(
        `Ошибка при импорте CSV для ${userId}: ${(error as Error).message}`,
      );
      await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
    }
  });
}
