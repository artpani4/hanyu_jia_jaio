// service/db/mod.ts
import * as user from "./queries/user.ts";
import * as word from "../services/kv/words.ts";

export const db = {
  user,
  word,
};
