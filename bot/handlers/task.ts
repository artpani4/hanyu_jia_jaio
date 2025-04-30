// bot/handlers/task.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { wordService } from "../../services/words.ts";
import { aiService } from "../../services/ai.ts";
import { SupportedLanguage } from "../../types.ts";
import { getString } from "../../utils/strings.ts";
import { mainKeyboard } from "../keyboards.ts";
import type { MyContext } from "../mod.ts";

export function setupTaskCallbackHandlers(bot: Bot<MyContext>) {
  bot.callbackQuery("get_task", async (ctx) => {
    await ctx.answerCallbackQuery({
      text: "⏳ Подбираем задание...",
      show_alert: false,
    }).catch(() => {});
    ctx.session.mode = "idle";

    queueMicrotask(async () => {
      try {
        const userId = ctx.from!.id.toString();
        const [user, userErr] = await userDb.getUserByTelegramId(ctx.from!.id);
        if (userErr || !user) {
          await ctx.reply("❌ User not found");
          return;
        }

        const lang = user.language as SupportedLanguage;
        const wordCount = await wordService.getUserWordCount(userId);
        if (wordCount === 0) {
          await ctx.reply(getString(lang, "NO_WORDS_ERROR"), {
            reply_markup: mainKeyboard(lang),
          });
          return;
        }

        const words = await wordService.getLeastUsedWords(userId, 10);
        const result = await aiService.generateSentences(words, lang);

        if (!result.success || (result.sentences ?? []).length === 0) {
          throw new Error(result.error || "No sentences generated");
        }

        const usedWords = words.filter((w) =>
          result.sentences!.some((sentence) => sentence.includes(w.hanzi))
        );
        const usedWordIds = usedWords.map((w) => w.id);
        await wordService.updateWordsUsage(userId, usedWordIds);

        const translated: string[] = [];
        const chinese: string[] = [];

        for (const line of result.sentences ?? []) {
          const [tr, zh] = line.split("||").map((s) => s.trim());
          if (tr && zh) {
            translated.push(tr);
            chinese.push(zh);
          }
        }

        const taskMessage = [
          getString(lang, "TASK_PROMPT"),
          "",
          ...translated.map((tr, i) => `${i + 1}. ${tr}`),
          "",
          "🔍 Chinese originals (tap to reveal):",
          `<tg-spoiler>${
            chinese.map((zh, i) => `${i + 1}. ${zh}`).join("\n")
          }</tg-spoiler>`,
          "",
          "📊 Updated word frequencies:",
          usedWords.map((w) => `${w.hanzi}: used ${w.times_used + 1} time(s)`)
            .join(
              "\n",
            ),
        ].join("\n");

        await ctx.reply(taskMessage, {
          reply_markup: mainKeyboard(lang),
          parse_mode: "HTML",
        });
      } catch (error) {
        await ctx.reply(
          `❌ Error getting task: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    });
  });
}
