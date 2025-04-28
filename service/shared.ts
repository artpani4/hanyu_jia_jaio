// service/shared.ts
import { Hono } from "@hono/hono";
import Tuner from "@artpani/tuner";
import { BaseCfgType } from "../config/base.tuner.ts";
import { createClient } from "@supabase/supabase-js";
import luminous from "@vseplet/luminous";
import { Bot } from "@grammy";
import { bindBotHandlers, bindMessageHandlers } from "$bot";
import { bindCallbackHandlers } from "./bot/handlers/callback.ts";

// Логгер
const loggerOptions = new luminous.OptionsBuilder().setName("shared").build();
const log = new luminous.Logger(loggerOptions);

// Загрузка конфигурации
log.inf("Загрузка конфигурации...");
export const config = await Tuner.use.loadConfig<BaseCfgType>({
  configDirPath: "./config",
});
const env = config.env;

// Hono приложение
export const app = new Hono();

// Telegram бот
log.inf("Инициализация Telegram-бота...");
export const bot = new Bot(env.TG_BOT_TOKEN, {
  client: {
    canUseWebhookReply: (method) => method === "sendChatAction",
  },
});
bindBotHandlers(bot);
bindCallbackHandlers(bot);
bindMessageHandlers(bot);
log.dbg("Бот инициализирован");

// Supabase клиент
log.inf("Подключение к Supabase...");
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY,
  {
    db: {
      schema: env.SUPABASE_SCHEMA,
    },
  },
);
log.dbg(`Supabase подключён (схема: ${env.SUPABASE_SCHEMA})`);
