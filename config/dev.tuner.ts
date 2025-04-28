// config/dev.tuner.ts
import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const devCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),
  env: {
    SUPABASE_SCHEMA: Tuner.Env.getString.orDefault("dev"),
  },
  data: {
    // Можно переопределить любые данные из базового конфига для dev-среды
  },
});

export default devCfg;
export type DevCfgType = typeof devCfg;
