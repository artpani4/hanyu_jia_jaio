// bot/commands.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../services/db.ts";
import { wordService } from "../services/words.ts";
import { SupportedLanguage } from "../types.ts";
import { detectLang, getString } from "../utils/strings.ts";
import { logger } from "../utils/logger.ts";
import { adminKeyboard, languageKeyboard, mainKeyboard } from "./keyboards.ts";
import { ENV } from "../config/mod.ts";

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

      // Use admin keyboard if user is admin
      const keyboard = user.id.toString() === ENV.ADMIN_ID
        ? adminKeyboard(lang)
        : mainKeyboard(lang);

      await ctx.reply(getString(lang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: keyboard,
      });
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
        await ctx.reply(getString(lang, "STATS_NO_WORDS"), {
          reply_markup: user.id.toString() === ENV.ADMIN_ID
            ? adminKeyboard(lang)
            : mainKeyboard(lang),
        });
        return;
      }

      // Get detailed stats
      const stats = await wordService.getWordStats(user.id);

      // Format top words
      const topWordsText = stats.topWords.length > 0
        ? stats.topWords.map((w, i) => `${i + 1}. ${w.word} (${w.timesUsed})`)
          .join("\n")
        : "-";

      // Build and send stats message
      const statsMessage = getString(lang, "STATS_MESSAGE", {
        total: stats.total,
        used: stats.used,
        unused: stats.unused,
        top_words: topWordsText,
      });

      await ctx.reply(statsMessage, {
        reply_markup: user.id.toString() === ENV.ADMIN_ID
          ? adminKeyboard(lang)
          : mainKeyboard(lang),
      });
    } catch (e) {
      logger.error(
        `Error in /stats: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong while getting statistics.");
    }
  });

  // Reset command - allows users to reset their words
  bot.command("reset", async (ctx) => {
    try {
      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);

      if (err) {
        logger.error(`Error getting user for reset: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";

      // Ask for confirmation
      await ctx.reply(getString(lang, "RESET_CONFIRMATION"), {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: getString(lang, "CONFIRM_YES"),
                callback_data: "reset_confirm_yes",
              },
              {
                text: getString(lang, "CONFIRM_NO"),
                callback_data: "reset_confirm_no",
              },
            ],
          ],
        },
      });
    } catch (e) {
      logger.error(
        `Error in /reset: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong.");
    }
  });

  // Admin command to get global statistics
  bot.command("admin", async (ctx) => {
    try {
      const userId = ctx.from!.id.toString();

      // Check if user is admin
      if (userId !== ENV.ADMIN_ID) {
        logger.warn(`Non-admin user ${userId} tried to access admin stats`);
        await ctx.reply("⛔ You don't have permission to use this command.");
        return;
      }

      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);

      if (err) {
        logger.error(`Error getting admin user: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";

      // Get global stats
      const stats = await wordService.getGlobalStats();

      // Format and send message
      const statsMessage = getString(lang, "ADMIN_STATS_MESSAGE", {
        users_count: stats.usersCount,
        active_users: stats.activeUsers,
        words_count: stats.wordsCount,
        avg_words: stats.avgWordsPerUser,
      });

      await ctx.reply(statsMessage, {
        reply_markup: adminKeyboard(lang),
      });
    } catch (e) {
      logger.error(
        `Error in /admin: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("🚫 Something went wrong.");
    }
  });

  // Set up commands in Telegram menu
  const setupBotCommands = async () => {
    try {
      await bot.api.setMyCommands([
        { command: "start", description: "Start the bot" },
        { command: "language", description: "Change language" },
        { command: "stats", description: "Show word statistics" },
        { command: "reset", description: "Reset all words" },
        { command: "help", description: "Show help information" },
      ]);
      logger.info("Bot commands set up successfully");
    } catch (e) {
      logger.error(
        `Error setting up bot commands: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }
  };

  // Run setup on initialization
  setupBotCommands();
}
