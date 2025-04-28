// service/main.ts
import { app, bot, config } from "$shared";
import luminous from "@vseplet/luminous";
import { webhookRoutes } from "./api/webhook.ts";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("main").build(),
);

// Подключаем маршруты
app.route("/", webhookRoutes);

// Обработка ошибок
app.onError((err, c) => {
  logger.err(`Необработанная ошибка: ${err}`);
  return c.text("Internal Server Error", 500);
});

// Запуск сервера
async function start() {
  try {
    // Устанавливаем вебхук
    // const webhookUrl = config.env.WEBHOOK_URL;
    // await bot.api.setWebhook(webhookUrl);
    // logger.inf(`✅ Вебхук установлен на ${webhookUrl}`);

    // Запускаем сервер
    const port = 8000;
    logger.inf(`🚀 Сервер запущен на порту ${port}`);

    Deno.serve({ port }, app.fetch);
  } catch (error) {
    logger.err(`Ошибка при запуске сервера: ${error}`);
    Deno.exit(1);
  }
}

start();
