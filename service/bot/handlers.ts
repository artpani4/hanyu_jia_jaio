// service/bot/handlers.ts
import { Bot } from "@grammy";
import luminous from "@vseplet/luminous";
import { detectLang, getString } from "$strings";
import { db } from "$db";
import { languageKeyboard } from "./keyboards/language.ts";
import { mainKeyboard } from "./keyboards/main.ts";

import { TextParser } from "../services/import/text.ts";
import { CSVParser } from "../services/import/csv.ts";
import { GoogleSheetParser } from "../services/import/gsheet.ts";
import { NotionParser } from "../services/import/notion.ts";
import { config } from "$shared";
import { createAIProvider } from "../services/ai/factory.ts";
import { SupportedLanguage } from "$constants";
import { importOptionsKeyboard } from "./keyboards/import.ts";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("bot").build(),
);

function isGoogleSheetUrl(url: string) {
  return url.includes("docs.google.com/spreadsheets/");
}

function isNotionUrl(url: string) {
  return url.includes("notion.so/");
}

export function bindBotHandlers(bot: Bot) {
  // /start команда
  bot.command("start", async (ctx) => {
    const user = ctx.from!;
    logger.inf(`/start от ${user.id} (${user.username ?? "no_username"})`);

    try {
      const [dbUser, err] = await db.user.upsertUser(user.id, {
        username: user.username,
        language: detectLang(user.language_code),
      });

      if (err) {
        logger.err(`Ошибка при сохранении пользователя: ${err.message}`);
        await ctx.reply("🚫 Произошла ошибка. Попробуйте позже.");
        return;
      }

      const lang = dbUser.language as SupportedLanguage;

      await ctx.reply(getString(lang, "WELCOME_MESSAGE"), {
        reply_markup: languageKeyboard,
      });

      await ctx.reply(getString(lang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: importOptionsKeyboard(),
      });
    } catch (e) {
      logger.err(`Ошибка в /start: ${(e as Error).message}`);
      await ctx.reply("🚫 Что-то пошло не так.");
    }
  });

  // /language команда
  bot.command("language", async (ctx) => {
    const [user, err] = await db.user.getUserByTelegramId(ctx.from!.id);
    const lang = user?.language as SupportedLanguage ?? "en";

    await ctx.reply(getString(lang, "LANG_PICK"), {
      reply_markup: languageKeyboard,
    });
  });

  // /help команда
  bot.command("help", async (ctx) => {
    const [user, err] = await db.user.getUserByTelegramId(ctx.from!.id);
    const lang = user?.language as SupportedLanguage ?? "en";

    await ctx.reply(getString(lang, "HELP_MESSAGE"));
  });
}
