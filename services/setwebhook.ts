// service/helpers/setWebhook.ts

import { createBot } from "../bot/mod.ts";
import { config } from "../config/mod.ts";
import { logger } from "../utils/logger.ts";

const bot = createBot();
const baseUrl = config.env.WEBHOOK_URL;

if (!baseUrl) {
  logger.error("WEBHOOK_URL environment variable is not set!");
  Deno.exit(1);
}

// Construct the full webhook URL with the correct endpoint
const webhookUrl = `${baseUrl}`;

try {
  const response = await bot.api.setWebhook(webhookUrl);
  if (response) {
    logger.info(`✅ Webhook set successfully to: ${webhookUrl}`);
  } else {
    logger.error("Failed to set webhook");
    Deno.exit(1);
  }
} catch (error) {
  logger.error(
    `Error setting webhook: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  Deno.exit(1);
}
