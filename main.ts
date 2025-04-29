// main.ts
import { Hono } from "https://deno.land/x/hono@v3.5.6/mod.ts";
import { webhookCallback } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { createBot } from "./bot/mod.ts";
import { config } from "./config/mod.ts";
import { logger } from "./utils/logger.ts";

// Set log level
logger.info("Starting application...");

// Create bot instance
const bot = createBot();

// Create Hono app
const app = new Hono();

// Create webhook handler
const handleUpdate = webhookCallback(bot, "hono");

// // Telegram updates route with logging
// app.use("/telegramGetUpdates", async (c, next) => {
//   const body = await c.req.text();
//   logger.info("📨 Received POST /telegramGetUpdates");
//   logger.debug("Request body:\n" + body);

//   // Set the body back so it can be read again by the handler
//   //   c.req = new Request(c.req.url, {
//   //     method: c.req.method,
//   //     headers: c.req.headers,
//   //     body,
//   //   });

//   await next();
// });

// Process telegram updates
app.post("/telegramGetUpdates", handleUpdate);

// Health check route
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.onError((err, c) => {
  logger.error(`Unhandled error: ${err}`);
  return c.text("Internal Server Error", 500);
});

// Start server
logger.info(`🚀 Starting server on port ${config.env.PORT || 8000}`);
Deno.serve({ port: Number(config.env.PORT || 8000) }, app.fetch);
