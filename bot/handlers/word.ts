// bot/handlers/word.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { wordService } from "../../services/words.ts";
import { SupportedLanguage } from "../../types.ts";
import { getString } from "../../utils/strings.ts";
import { mainKeyboard } from "../keyboards.ts";
import type { MyContext } from "../mod.ts";

export function setupWordCallbackHandlers(bot: Bot<MyContext>) {
  // Callback for adding words
  bot.callbackQuery("add_words", async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.mode = "awaiting_words";
    queueMicrotask(async () => {
      const userId = ctx.from!.id;
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        await ctx.reply("❌ User not found");
        return;
      }
      const lang = user.language as SupportedLanguage;
      await ctx.reply(getString(lang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: mainKeyboard(lang),
      });
    });
  });

  // Callback for showing reset confirmation
  bot.callbackQuery("reset_words", async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.mode = "idle";
    queueMicrotask(async () => {
      const userId = ctx.from!.id;
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        await ctx.reply("❌ User not found");
        return;
      }
      const lang = user.language as SupportedLanguage;
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
    });
  });

  // Callback for confirming reset
  bot.callbackQuery("reset_confirm_yes", async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.mode = "idle";
    queueMicrotask(async () => {
      const userId = ctx.from!.id;
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        await ctx.reply("❌ User not found");
        return;
      }
      const lang = user.language as SupportedLanguage;
      await wordService.resetWords(user.id);
      await ctx.editMessageText(getString(lang, "RESET_SUCCESS"), {
        reply_markup: mainKeyboard(lang),
      });
    });
  });

  // Callback for canceling reset
  bot.callbackQuery("reset_confirm_no", async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    ctx.session.mode = "idle";
    queueMicrotask(async () => {
      const userId = ctx.from!.id;
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        await ctx.reply("❌ User not found");
        return;
      }
      const lang = user.language as SupportedLanguage;
      await ctx.editMessageText(getString(lang, "RESET_CANCELED"), {
        reply_markup: mainKeyboard(lang),
      });
    });
  });
}
