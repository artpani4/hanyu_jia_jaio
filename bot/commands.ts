// bot/commands.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../services/db.ts";
import { wordService } from "../services/words.ts";
import { SupportedLanguage } from "../types.ts";
import { detectLang, getString } from "../utils/strings.ts";
import { logger } from "../utils/logger.ts";
import { languageKeyboard, mainKeyboard } from "./keyboards.ts";

// Bot command handlers
export function setupCommands(bot: Bot) {
  // Start command
  bot.command("start", async (ctx) => {
    const user = ctx.from!;
    logger.info(`/start from ${user.id} (${user.username ?? "no_username"})`);

    try {
      const [dbUser, err] = await userDb.upsertUser(user.id, {
        username: user.username,
        language: detectLang(user.language_code),
      });

      if (err) {
        logger.error(`Error saving user: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = dbUser?.language as SupportedLanguage ?? "en";

      await ctx.reply(getString(lang, "WELCOME_MESSAGE"), {
        reply_markup: languageKeyboard,
      });

      await ctx.reply(getString(lang, "ADD_WORDS_INSTRUCTION"));
    } catch (e) {
      logger.error(
        `Error in /start: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong.");
    }
  });

  // Language command
  bot.command("language", async (ctx) => {
    try {
      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);

      if (err) {
        logger.error(`Error getting user for language: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";

      await ctx.reply(getString(lang, "LANG_PICK"), {
        reply_markup: languageKeyboard,
      });
    } catch (e) {
      logger.error(
        `Error in /language: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong.");
    }
  });

  // Help command
  bot.command("help", async (ctx) => {
    try {
      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);

      if (err) {
        logger.error(`Error getting user for help: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";

      await ctx.reply(getString(lang, "HELP_MESSAGE"));
    } catch (e) {
      logger.error(
        `Error in /help: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong.");
    }
  });

  // Stats command - new command for word statistics
  bot.command("stats", async (ctx) => {
    try {
      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);

      if (err) {
        logger.error(`Error getting user for stats: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";

      // Get word count first to check if user has any words
      const wordCount = await wordService.getUserWordCount(user.id);

      if (wordCount === 0) {
        await ctx.reply(getString(lang, "STATS_NO_WORDS"));
        return;
      }

      // Get detailed stats
      const stats = await wordService.getWordStats(user.id);

      // Format top words
      const topWordsText = stats.topWords.length > 0
        ? stats.topWords.map((w, i) => `${i + 1}. ${w.word} (${w.timesUsed})`)
          .join("\n")
        : "нет данных";

      // Build and send stats message
      const statsMessage = getString(lang, "STATS_MESSAGE", {
        total: stats.total,
        used: stats.used,
        unused: stats.unused,
        top_words: topWordsText,
      });

      await ctx.reply(statsMessage, {
        reply_markup: mainKeyboard(lang),
      });
    } catch (e) {
      logger.error(
        `Error in /stats: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong while getting statistics.");
    }
  });
}
