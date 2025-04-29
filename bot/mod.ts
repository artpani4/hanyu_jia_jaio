// bot/mod.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { ENV } from "../config.ts";
import { logger } from "../utils/logger.ts";
import { setupCommands } from "./commands.ts";
import { setupCallbackHandlers, setupMessageHandlers } from "./handlers.ts";

// Initialize and configure the bot
export function createBot(): Bot {
  // Create bot instance
  const bot = new Bot(ENV.TG_BOT_TOKEN, {
    client: {
      canUseWebhookReply: (method) => method === "sendChatAction",
    },
  });

  // Setup error handling
  bot.catch((err) => {
    const ctx = err.ctx;
    logger.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof Error) {
      logger.error(`Error: ${e.message}`);
      logger.error(e.stack || "No stack trace");
    } else {
      logger.error(`Unknown error: ${e}`);
    }
  });

  // Register all handlers
  setupCommands(bot);
  setupMessageHandlers(bot);
  setupCallbackHandlers(bot);

  logger.info("Bot initialized and configured");

  return bot;
}
