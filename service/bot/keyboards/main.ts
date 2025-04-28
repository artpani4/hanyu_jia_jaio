// service/bot/keyboards/main.ts
import { InlineKeyboard } from "@grammy";
import { SupportedLanguage } from "$constants";
import { getString } from "$strings";

export function mainKeyboard(lang: SupportedLanguage) {
  return new InlineKeyboard()
    .text(getString(lang, "GET_TASK_BUTTON"), "get_task");
}
