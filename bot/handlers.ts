// bot/handlers.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../services/db.ts";
import { wordService } from "../services/words.ts";
import { aiService } from "../services/ai.ts";
import { SupportedLanguage, WordData } from "../types.ts";
import { getString } from "../utils/strings.ts";
import { ENV, WORD_FORMAT } from "../config/mod.ts";
import { adminKeyboard, mainKeyboard } from "./keyboards.ts";
import type { MyContext } from "./mod.ts";
import { logger } from "../utils/logger.ts";

function parseTextToWords(
  text: string,
): { words: WordData[]; invalidLines: string[] } {
  const lines = text.split("\n").map((line) => line.trim()).filter((line) =>
    line.length > 0
  );
  const validWords: WordData[] = [];
  const invalidLines: string[] = [];

  for (const line of lines) {
    const parts = line.split(WORD_FORMAT.separator).map((p) => p.trim());
    let hanzi = "", pinyin = "", translation = "", word = "";

    if (parts.length === 1) {
      hanzi = word = parts[0];
    } else if (parts.length === 2) {
      [hanzi, translation] = parts;
      word = hanzi;
    } else if (parts.length >= 3) {
      [hanzi, pinyin, translation] = parts;
      word = hanzi;
    }

    const entry: WordData = { word, hanzi, pinyin, translation };

    if (isValidWord(entry)) {
      validWords.push(entry);
    } else {
      invalidLines.push(line);
    }
  }

  return { words: validWords, invalidLines };
}

function isValidWord(word: WordData): boolean {
  return word.word.length > 0 && word.hanzi.length > 0;
}

export function setupMessageHandlers(bot: Bot<MyContext>) {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text.startsWith("/")) return;

    if (ctx.session.mode !== "awaiting_words") {
      await ctx.reply(
        "Чтобы добавить слова, нажмите кнопку «📌 Добавить слова».\n\nПримеры:\n" +
          "• 你好\n• 你好 | привет\n• 你好 | nǐ hǎo | привет",
      );
      return;
    }

    const userId = ctx.from.id;
    const [user, userErr] = await userDb.getUserByTelegramId(userId);
    if (userErr || !user) {
      await ctx.reply("❌ Error. Try using /start");
      return;
    }

    const lang = user.language as SupportedLanguage;
    const { words, invalidLines } = parseTextToWords(ctx.message.text);

    if (words.length === 0) {
      await ctx.reply(
        `${getString(lang, "WORDS_IMPORT_ERROR")}\n\nПримеры:\n` +
          `• 你好\n• 你好 | привет\n• 你好 | nǐ hǎo | привет`,
        { reply_markup: mainKeyboard(lang) },
      );
      return;
    }

    const addedCount = await wordService.addWords(user.id, words);
    ctx.session.mode = "idle";

    let replyText = `${
      getString(lang, "WORDS_ADDED")
    } Words added: ${addedCount}`;
    if (invalidLines.length > 0) {
      replyText += `\n\n⚠️ Пропущены строки с ошибками:\n` +
        invalidLines.map((l) => `- ${l}`).join("\n") +
        `\n\nДопустимые форматы:\n` +
        `• 你好\n• 你好 | привет\n• 你好 | nǐ hǎo | привет`;
    }

    await ctx.reply(replyText, {
      reply_markup: mainKeyboard(lang),
    });
  });
}

export function setupCallbackHandlers(bot: Bot<MyContext>) {
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

  bot.callbackQuery("get_task", async (ctx) => {
    await ctx.answerCallbackQuery({
      text: "⏳ Подбираем задание...",
      show_alert: false,
    }).catch(() => {});
    ctx.session.mode = "idle";
    queueMicrotask(async () => {
      try {
        const userId = ctx.from!.id;
        const [user, userErr] = await userDb.getUserByTelegramId(userId);
        if (userErr || !user) {
          await ctx.reply("❌ User not found");
          return;
        }

        const lang = user.language as SupportedLanguage;
        const wordCount = await wordService.getUserWordCount(user.id);
        if (wordCount === 0) {
          await ctx.reply(getString(lang, "NO_WORDS_ERROR"), {
            reply_markup: mainKeyboard(lang),
          });
          return;
        }

        const words = await wordService.getLeastUsedWords(user.id, 10);
        const result = await aiService.generateSentences(words, lang);
        // console.log(result);
        if (!result.success || (result.sentences ?? []).length === 0) {
          throw new Error(result.error || "No sentences generated");
        }

        const usedWords = words.filter((w) =>
          result.sentences!.some((sentence) => sentence.includes(w.hanzi))
        );
        const usedWordIds = usedWords.map((w) => w.id);
        await wordService.updateWordsUsage(user.id, usedWordIds);

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
          words.map((w) => `${w.hanzi}: used ${w.times_used + 1} time(s)`).join(
            "\n",
          ),
        ].join("\n");

        await ctx.reply(taskMessage, {
          reply_markup: mainKeyboard(lang),
          parse_mode: "HTML",
        });
      } catch {
        await ctx.reply("❌ Error getting task");
      }
    });
  });

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
        avg_words_per_user: stats.avgWordsPerUser,
      });
      await ctx.reply(statsMessage, {
        reply_markup: adminKeyboard(lang),
      });
    });
  });
}
