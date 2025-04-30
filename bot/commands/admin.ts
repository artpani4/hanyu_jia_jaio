// bot/commands/admin.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { wordService } from "../../services/words.ts";
import { SupportedLanguage } from "../../types.ts";
import { getString } from "../../utils/strings.ts";
import { logger } from "../../utils/logger.ts";
import { adminKeyboard } from "../keyboards.ts";
import { ENV } from "../../config/mod.ts";
import type { MyContext } from "../mod.ts";

export function setupAdminCommands(bot: Bot<MyContext>) {
  // /admin
  bot.command("admin", async (ctx) => {
    try {
      ctx.session.mode = "idle";

      const userId = ctx.from!.id.toString();
      if (userId !== ENV.ADMIN_ID) {
        logger.warn(`Non-admin user ${userId} tried to access admin stats`);
        await ctx.reply("⛔ You don't have permission to use this command.");
        return;
      }

      // Get user from KV storage
      const [user, err] = await userDb.getUserByTelegramId(ctx.from!.id);
      if (err) {
        logger.error(`Error getting admin user: ${err.message}`);
        await ctx.reply("🚫 An error occurred. Please try again later.");
        return;
      }

      const lang = user?.language as SupportedLanguage ?? "en";
      const stats = await wordService.getGlobalStats();

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
}
