// config/prod.tuner.ts
import Tuner from "@artpani/tuner";
import { BaseCfgType } from "./base.tuner.ts";

const prodCfg = Tuner.tune({
  parent: Tuner.Load.local.configDir<BaseCfgType>("base.tuner.ts"),
  env: {
    SUPABASE_SCHEMA: Tuner.Env.getString.orDefault("public"),
  },
  data: {
    // Можно переопределить любые данные из базового конфига для prod-среды
  },
});

export default prodCfg;
export type ProdCfgType = typeof prodCfg;
