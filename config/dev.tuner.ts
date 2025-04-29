// config/dev.tuner.ts
import Tuner from "https://deno.land/x/tuner@v0.6.7/mod.ts?source";
import baseConfig from "./base.tuner.ts";

export default Tuner.tune({
  extends: baseConfig,
  data: {
    logLevel: "debug",
    isDebug: true,
  },
});
