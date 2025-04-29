// main.ts
import { Hono } from "https://deno.land/x/hono@v3.5.6/mod.ts";
import { webhookCallback } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { createBot } from "./bot/mod.ts";
import { ENV, validateEnv } from "./config.ts";
import { logger, LogLevel } from "./utils/logger.ts";

// Set log level
logger.info("Starting application...");

// Validate environment variables
try {
  validateEnv();
  logger.info("Environment validation successful");
} catch (error) {
  logger.error(
    `Environment validation failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  Deno.exit(1);
}

// Create bot instance
const bot = createBot();

// Create Hono app
const app = new Hono();

// Create webhook handler
const handleUpdate = webhookCallback(bot, "hono");

// Webhook route
app.post("/telegramWebhook", async (c) => {
  try {
    const body = await c.req.text();
    logger.info("📨 Received webhook request");
    logger.debug(`Request body: ${body}`);

    // Process update
    return await handleUpdate(c);
  } catch (error) {
    logger.error(
      `❌ Webhook error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return c.text("Internal Server Error", 500);
  }
});

// Health check route
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Error handler
app.onError((err, c) => {
  logger.error(`Unhandled error: ${err}`);
  return c.text("Internal Server Error", 500);
});

// Start server
async function start() {
  try {
    // Set webhook (uncomment when deploying)
    // const webhookUrl = "YOUR_WEBHOOK_URL";
    // await bot.api.setWebhook(webhookUrl);
    // logger.info(`✅ Webhook set to ${webhookUrl}`);

    // Start polling if not using webhook
    logger.info("🤖 Starting bot with long polling");
    await bot.start();

    // Start server
    // const port = 8000;
    // logger.info(`🚀 Server running on port ${port}`);
    // Deno.serve({ port }, app.fetch);
  } catch (error) {
    logger.error(
      `Error starting server: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    Deno.exit(1);
  }
}

start();
