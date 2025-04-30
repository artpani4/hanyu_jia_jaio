// bot/handlers/text.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../../services/db.ts";
import { wordService } from "../../services/words.ts";
import { SupportedLanguage, WordData } from "../../types.ts";
import { getString } from "../../utils/strings.ts";
import { WORD_FORMAT } from "../../config/mod.ts";
import { mainKeyboard } from "../keyboards.ts";
import type { MyContext } from "../mod.ts";

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

export function setupTextMessageHandlers(bot: Bot<MyContext>) {
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
