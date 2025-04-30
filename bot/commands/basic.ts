// bot/commands/basic.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { wordService } from "../../services/words.ts";
import { SupportedLanguage } from "../../types.ts";
import { detectLang, getString } from "../../utils/strings.ts";
import { logger } from "../../utils/logger.ts";
import { adminKeyboard, languageKeyboard, mainKeyboard } from "../keyboards.ts";
import { ENV } from "../../config/mod.ts";
import type { MyContext } from "../mod.ts";

export function setupBasicCommands(bot: Bot<MyContext>) {
  // /start
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
      ctx.session.mode = "idle";

      await ctx.reply(getString(lang, "WELCOME_MESSAGE"), {
        reply_markup: languageKeyboard,
      });

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

  // /language
  bot.command("language", async (ctx) => {
    try {
      ctx.session.mode = "idle";

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

  // /help
  bot.command("help", async (ctx) => {
    try {
      ctx.session.mode = "idle";

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

  // /stats
  bot.command("stats", async (ctx) => {
    try {
      ctx.session.mode = "idle";

      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);
      if (err) {
        logger.error(`Error getting user for stats: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";
      const wordCount = await wordService.getUserWordCount(user.id);

      if (wordCount === 0) {
        await ctx.reply(getString(lang, "STATS_NO_WORDS"), {
          reply_markup: user.id.toString() === ENV.ADMIN_ID
            ? adminKeyboard(lang)
            : mainKeyboard(lang),
        });
        return;
      }

      const stats = await wordService.getWordStats(user.id);

      const topWordsText = stats.topWords.length > 0
        ? stats.topWords.map((w, i) => `${i + 1}. ${w.word} (${w.timesUsed})`)
          .join("\n")
        : "-";

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

  // /reset
  bot.command("reset", async (ctx) => {
    try {
      ctx.session.mode = "idle";

      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);
      if (err) {
        logger.error(`Error getting user for reset: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";

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
}
