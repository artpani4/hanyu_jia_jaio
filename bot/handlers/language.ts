// bot/handlers/language.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { SupportedLanguage } from "../../types.ts";
import { getString } from "../../utils/strings.ts";
import { mainKeyboard } from "../keyboards.ts";
import type { MyContext } from "../mod.ts";

export function setupLanguageCallbackHandlers(bot: Bot<MyContext>) {
  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery().catch(() => {});
    queueMicrotask(async () => {
      const selectedLang = ctx.match![1] as SupportedLanguage;
      const userId = ctx.from!.id;
      const [updatedUser, err] = await userDb.updateUserLanguage(
        userId,
        selectedLang,
      );
      if (err) {
        await ctx.reply("❌ Error changing language");
        return;
      }
      await ctx.editMessageText(getString(selectedLang, "LANG_SELECTED"));
      await ctx.reply(getString(selectedLang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: mainKeyboard(selectedLang),
      });
    });
  });
}
