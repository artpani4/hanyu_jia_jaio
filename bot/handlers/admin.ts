// bot/handlers/admin.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { wordService } from "../../services/words.ts";
import { SupportedLanguage } from "../../types.ts";
import { getString } from "../../utils/strings.ts";
import { adminKeyboard } from "../keyboards.ts";
import { ENV } from "../../config/mod.ts";
import type { MyContext } from "../mod.ts";

export function setupAdminCallbackHandlers(bot: Bot<MyContext>) {
  bot.callbackQuery("admin_stats", async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.mode = "idle";
    queueMicrotask(async () => {
      const userId = ctx.from!.id.toString();
      if (userId !== ENV.ADMIN_ID) {
        await ctx.reply("⛔ You don't have permission to use this command.");
        return;
      }
      const [user, userErr] = await userDb.getUserByTelegramId(
        parseInt(userId),
      );
      if (userErr || !user) {
        await ctx.reply("❌ User not found");
        return;
      }
      const lang = user.language as SupportedLanguage;
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
    });
  });
}
