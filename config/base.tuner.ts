import Tuner from "@artpani/tuner";

const baseCfg = Tuner.tune({
  env: {
    TG_BOT_TOKEN: Tuner.Env.getString.orExit("Telegram bot token is required"),
    DEEPSEEK_API_KEY: Tuner.Env.getString.orExit(
      "DeepSeek API key is required",
    ),
    SUPABASE_URL: Tuner.Env.getString.orExit("Supabase URL is required"),
    SUPABASE_KEY: Tuner.Env.getString.orExit("Supabase key is required"),
    SUPABASE_SCHEMA: Tuner.Env.getString.orDefault("public"),
    WEBHOOK_URL: Tuner.Env.getString.orNothing(),
    PORT: Tuner.Env.getString.orDefault("8000"),
    ADMIN_ID: Tuner.Env.getString.orNothing(),
  },
  data: {
    logLevel: "info",
    appName: "Chinese Learning Bot",
    version: "1.0.0",
  },
});

export default baseCfg;
export type BaseCFGType = typeof baseCfg;
