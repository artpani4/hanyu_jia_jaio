// bot/commands/menu.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { logger } from "../../utils/logger.ts";
import type { MyContext } from "../mod.ts";

// Setup commands for Telegram menu
export async function setupBotCommands(bot: Bot<MyContext>) {
  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "language", description: "Change language" },
      { command: "stats", description: "Show word statistics" },
      { command: "reset", description: "Reset all words" },
      { command: "help", description: "Show help information" },
    ]);
    logger.info("Bot commands set up successfully");
  } catch (e) {
    logger.error(
      `Error setting up bot commands: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
    throw e;
  }
}
