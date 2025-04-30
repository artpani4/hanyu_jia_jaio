import { config } from "./config/mod.ts";

export const kv = config.env.DEV
  ? await Deno.openKv("test")
  : await Deno.openKv();
