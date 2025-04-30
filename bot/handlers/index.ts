// bot/handlers/index.ts
import { Bot } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { setupTextMessageHandlers } from "./text.ts";
import { setupTaskCallbackHandlers } from "./task.ts";
import { setupWordCallbackHandlers } from "./word.ts";
import { setupAdminCallbackHandlers } from "./admin.ts";
import { setupLanguageCallbackHandlers } from "./language.ts";
import type { MyContext } from "../mod.ts";

export function setupMessageHandlers(bot: Bot<MyContext>) {
  setupTextMessageHandlers(bot);
}

export function setupCallbackHandlers(bot: Bot<MyContext>) {
  setupLanguageCallbackHandlers(bot);
  setupTaskCallbackHandlers(bot);
  setupWordCallbackHandlers(bot);
  setupAdminCallbackHandlers(bot);
}
