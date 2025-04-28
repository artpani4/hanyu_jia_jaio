// service/api/webhook.ts
import { Hono } from "@hono/hono";
import { webhookCallback } from "@grammy";
import { bot } from "$shared";
import luminous from "@vseplet/luminous";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("webhook").build(),
);

export const webhookRoutes = new Hono();

const handleUpdate = webhookCallback(bot, "hono");

webhookRoutes.post("/telegramGetUpdates", async (c) => {
  try {
    const body = await c.req.text();
    logger.inf("📨 Получен POST /telegramGetUpdates");
    logger.dbg("Тело запроса:\n" + body);

    // Обрабатываем апдейт
    return await handleUpdate(c);
  } catch (error) {
    logger.err(`❌ Ошибка вебхука: ${error}`);
    return c.text("Internal Server Error", 500);
  }
});

// Проверка здоровья
webhookRoutes.get("/health", (c) => {
  return c.json({ status: "ok" });
});
