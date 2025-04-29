// bot/handlers.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../services/db.ts";
import { wordService } from "../services/words.ts";
import { aiService } from "../services/ai.ts";
import { SupportedLanguage, WordData } from "../types.ts";
import { getString } from "../utils/strings.ts";
import { logger } from "../utils/logger.ts";
import { WORD_FORMAT } from "../config/mod.ts";
import { mainKeyboard } from "./keyboards.ts";

// Parse text input to words
function parseTextToWords(text: string): WordData[] {
  const words: WordData[] = [];
  const lines = text.split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const parts = line.split(WORD_FORMAT.separator)
      .map((part) => part.trim());

    // Handle both 3-part and 4-part formats
    if (parts.length >= 3) {
      const word: WordData = {
        // For 3-part format: hanzi|pinyin|translation
        // For 4-part format: word|pinyin|hanzi|translation
        word: parts.length === 3 ? parts[2] : parts[0],
        pinyin: parts[1],
        hanzi: parts.length === 3 ? parts[0] : parts[2],
        translation: parts.length === 3 ? parts[2] : parts[3],
      };

      if (isValidWord(word)) {
        words.push(word);
      }
    }
  }

  return words;
}

// Validate word data
function isValidWord(word: WordData): boolean {
  return (
    typeof word.word === "string" &&
    typeof word.pinyin === "string" &&
    typeof word.hanzi === "string" &&
    typeof word.translation === "string" &&
    word.pinyin.length > 0 &&
    word.hanzi.length > 0
  );
}

// Setup message handlers
export function setupMessageHandlers(bot: Bot) {
  // Text message handler for word input
  bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    logger.info(
      `Text message from user ${userId}: ${text.substring(0, 50)}${
        text.length > 50 ? "..." : ""
      }`,
    );

    // Skip if it's a command
    if (text.startsWith("/")) return;

    // Get user for language
    const [user, userErr] = await userDb.getUserByTelegramId(userId);
    if (userErr || !user) {
      logger.error(`Error getting user ${userId}: ${userErr?.message}`);
      await ctx.reply("❌ Error. Try using /start");
      return;
    }

    const lang = user.language as SupportedLanguage;

    // Parse text input to words
    try {
      const words = parseTextToWords(text);

      if (words.length === 0) {
        logger.warn(`No valid words found in text from user ${userId}`);
        await ctx.reply(
          `${getString(lang, "WORDS_IMPORT_ERROR")}\n\n` +
            `Example format: ${WORD_FORMAT.example}`,
        );
        return;
      }

      // Add words to database
      const addedCount = await wordService.addWords(user.id, words);

      // Confirm words added
      await ctx.reply(
        `${getString(lang, "WORDS_ADDED")} Words added: ${addedCount}`,
        { reply_markup: mainKeyboard(lang) },
      );
    } catch (error) {
      logger.error(
        `Error importing words for ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      await ctx.reply(getString(lang, "WORDS_IMPORT_ERROR"));
    }
  });
}

// Setup callback handlers
export function setupCallbackHandlers(bot: Bot) {
  // Language selection callback
  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery(); // Acknowledge the callback query immediately

    const selectedLang = ctx.match![1] as SupportedLanguage;
    const userId = ctx.from!.id;

    logger.info(`User ${userId} selected language: ${selectedLang}`);

    try {
      const [updatedUser, err] = await userDb.updateUserLanguage(
        userId,
        selectedLang,
      );

      if (err) {
        logger.error(`Error updating language: ${err.message}`);
        await ctx.reply("❌ Error changing language");
        return;
      }

      await ctx.editMessageText(getString(selectedLang, "LANG_SELECTED"));
      await ctx.reply(getString(selectedLang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: mainKeyboard(selectedLang),
      });
    } catch (e) {
      logger.error(
        `Error in language selection: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await ctx.reply("❌ Error changing language");
    }
  });

  // Task request callback
  bot.callbackQuery("get_task", async (ctx) => {
    await ctx.answerCallbackQuery(); // Acknowledge the callback query immediately

    const userId = ctx.from!.id;
    logger.info(`Processing task request from user ${userId}`);

    try {
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        logger.error(`Error getting user ${userId}: ${userErr?.message}`);
        await ctx.reply("❌ User not found");
        return;
      }

      const lang = user.language as SupportedLanguage;

      // Check if user has words
      const wordCount = await wordService.getUserWordCount(user.id);

      if (wordCount === 0) {
        await ctx.reply(getString(lang, "NO_WORDS_ERROR"), {
          reply_markup: mainKeyboard(lang),
        });
        return;
      }

      // Get least used words for task
      const words = await wordService.getLeastUsedWords(user.id, 10);

      try {
        // Generate sentences with AI
        const result = await aiService.generateSentences(words, lang);

        if (
          !result.success || !result.sentences || result.sentences.length === 0
        ) {
          throw new Error(result.error || "No sentences generated");
        }

        // Update word usage statistics
        const wordIds = words.map((w) => w.id);
        await wordService.updateWordsUsage(user.id, wordIds);

        // Format and send task message with spoiler for answers
        const taskMessage = [
          getString(lang, "TASK_PROMPT"),
          "",
          ...result.sentences.map((s, i) => `${i + 1}. ${s}`),
          "",
          "🔍 Answers (tap to reveal):",
          `<tg-spoiler>${
            words.map((w) => `${w.hanzi} (${w.pinyin}) - ${w.translation}`)
              .join("\n")
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
      } catch (error) {
        logger.error(
          `AI provider error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        await ctx.reply(getString(lang, "TASK_GENERATION_ERROR"), {
          reply_markup: mainKeyboard(lang),
        });
      }
    } catch (e) {
      logger.error(
        `Error getting task: ${e instanceof Error ? e.message : String(e)}`,
      );
      await ctx.reply("❌ Error getting task");
    }
  });

  // Add words button callback
  bot.callbackQuery("add_words", async (ctx) => {
    await ctx.answerCallbackQuery(); // Acknowledge the callback query immediately

    const userId = ctx.from!.id;
    logger.info(`User ${userId} requested to add words`);

    try {
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        logger.error(`Error getting user ${userId}: ${userErr?.message}`);
        await ctx.reply("❌ User not found");
        return;
      }

      const lang = user.language as SupportedLanguage;
      await ctx.reply(getString(lang, "ADD_WORDS_INSTRUCTION"), {
        reply_markup: mainKeyboard(lang),
      });
    } catch (e) {
      logger.error(
        `Error in add_words handler: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await ctx.reply("❌ Error");
    }
  });

  // Reset words callback
  bot.callbackQuery("reset_words", async (ctx) => {
    await ctx.answerCallbackQuery(); // Acknowledge the callback query immediately

    const userId = ctx.from!.id;
    logger.info(`User ${userId} requested to reset words`);

    try {
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        logger.error(`Error getting user ${userId}: ${userErr?.message}`);
        await ctx.reply("❌ User not found");
        return;
      }

      const lang = user.language as SupportedLanguage;

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
        `Error in reset_words handler: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await ctx.reply("❌ Error");
    }
  });

  // Reset confirmation callbacks
  bot.callbackQuery("reset_confirm_yes", async (ctx) => {
    await ctx.answerCallbackQuery(); // Acknowledge the callback query immediately

    const userId = ctx.from!.id;
    logger.info(`User ${userId} confirmed resetting words`);

    try {
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        logger.error(`Error getting user ${userId}: ${userErr?.message}`);
        await ctx.reply("❌ User not found");
        return;
      }

      const lang = user.language as SupportedLanguage;

      // Reset words
      await wordService.resetWords(user.id);

      await ctx.editMessageText(getString(lang, "RESET_SUCCESS"), {
        reply_markup: mainKeyboard(lang),
      });
    } catch (e) {
      logger.error(
        `Error in reset confirmation: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await ctx.reply("❌ Error resetting words");
    }
  });

  bot.callbackQuery("reset_confirm_no", async (ctx) => {
    await ctx.answerCallbackQuery(); // Acknowledge the callback query immediately

    const userId = ctx.from!.id;
    logger.info(`User ${userId} canceled reset operation`);

    try {
      const [user, userErr] = await userDb.getUserByTelegramId(userId);
      if (userErr || !user) {
        logger.error(`Error getting user ${userId}: ${userErr?.message}`);
        await ctx.reply("❌ User not found");
        return;
      }

      const lang = user.language as SupportedLanguage;

      await ctx.editMessageText(getString(lang, "RESET_CANCELED"), {
        reply_markup: mainKeyboard(lang),
      });
    } catch (e) {
      logger.error(
        `Error in reset cancellation: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await ctx.reply("❌ Error");
    }
  });
}
