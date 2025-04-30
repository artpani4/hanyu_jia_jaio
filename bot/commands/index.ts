// bot/commands/index.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { logger } from "../../utils/logger.ts";
import { setupBasicCommands } from "./basic.ts";
import { setupAdminCommands } from "./admin.ts";
import { setupBotCommands } from "./menu.ts";
import type { MyContext } from "../mod.ts";

// Bot command handlers
export function setupCommands(bot: Bot<MyContext>) {
  // Setup different command groups
  setupBasicCommands(bot);
  setupAdminCommands(bot);

  // Setup commands for Telegram menu
  setupBotCommands(bot).catch((e) => {
    logger.error(
      `Error setting up bot commands: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  });
}
