// bot/mod.ts
import { Bot, session } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import type {
  Context,
  SessionFlavor,
} from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { ENV } from "../config/mod.ts";
import { logger } from "../utils/logger.ts";
import { setupCommands } from "./commands/index.ts";
import {
  setupCallbackHandlers,
  setupMessageHandlers,
} from "./handlers/index.ts";

// Тип сессии
interface SessionData {
  mode: "idle" | "awaiting_words";
}

// Тип контекста с добавленным session
export type MyContext = Context & SessionFlavor<SessionData>;

// Создание и настройка бота
export function createBot(): Bot<MyContext> {
  const bot = new Bot<MyContext>(ENV.TG_BOT_TOKEN, {
    client: {
      canUseWebhookReply: (method) => method === "sendChatAction",
    },
  });

  // Включаем session middleware
  bot.use(session({ initial: (): SessionData => ({ mode: "idle" }) }));

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

  setupCommands(bot);
  setupMessageHandlers(bot);
  setupCallbackHandlers(bot);

  logger.info("Bot initialized and configured");

  return bot;
}
