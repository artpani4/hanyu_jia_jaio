// bot/handlers.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { userDb } from "../services/db.ts";
import { wordService } from "../services/words.ts";
import { aiService } from "../services/ai.ts";
import { SupportedLanguage, WordData } from "../types.ts";
import { getString } from "../utils/strings.ts";
import { logger } from "../utils/logger.ts";
import { WORD_FORMAT } from "../config.ts";
import { mainKeyboard } from "./keyboards.ts";

// Set of processed callback IDs to prevent duplicates
const processedCallbackIds = new Set<string>();
const MAX_PROCESSED_IDS = 100;

// Add to processed IDs with size limit
function addProcessedId(id: string) {
  processedCallbackIds.add(id);
  if (processedCallbackIds.size > MAX_PROCESSED_IDS) {
    const firstId = processedCallbackIds.values().next().value;
    processedCallbackIds.delete(firstId);
  }
}

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
    // Check for duplicate callbacks
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.debug(`Duplicate callback (language): ${callbackId}, ignoring`);
      await ctx.answerCallbackQuery();
      return;
    }

    // Mark as processed
    addProcessedId(callbackId);

    const selectedLang = ctx.match![1] as SupportedLanguage;
    const userId = ctx.from!.id;

    try {
      const [updatedUser, err] = await userDb.updateUserLanguage(
        userId,
        selectedLang,
      );

      if (err) {
        logger.error(`Error updating language: ${err.message}`);
        await ctx.answerCallbackQuery("❌ Error changing language");
        return;
      }

      await ctx.editMessageText(getString(selectedLang, "LANG_SELECTED"));
      await ctx.reply(getString(selectedLang, "ADD_WORDS_INSTRUCTION"));

      await ctx.answerCallbackQuery();
    } catch (e) {
      logger.error(
        `Error in language selection: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      await ctx.answerCallbackQuery("❌ Error");
    }
  });

  // Task request callback
  bot.callbackQuery("get_task", async (ctx) => {
    // Check for duplicate callbacks
    const callbackId = ctx.callbackQuery.id;
    if (processedCallbackIds.has(callbackId)) {
      logger.debug(`Duplicate callback (get_task): ${callbackId}, ignoring`);
      await ctx.answerCallbackQuery();
      return;
    }

    logger.info(`Processing task request, ID: ${callbackId}`);

    // Mark as processed
    addProcessedId(callbackId);

    const userId = ctx.from!.id;

    try {
      // Answer callback immediately
      await ctx.answerCallbackQuery();

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
        await ctx.reply(getString(lang, "NO_WORDS_ERROR"));
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

        // Format and send task message
        const taskMessage = [
          getString(lang, "TASK_PROMPT"),
          "",
          ...result.sentences.map((s, i) => `${i + 1}. ${s}`),
        ].join("\n");

        await ctx.reply(taskMessage, {
          reply_markup: mainKeyboard(lang),
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
}
