// bot/keyboards.ts
import { InlineKeyboard } from "https://deno.land/x/grammy@v1.18.1/mod.ts";
import { SupportedLanguage } from "../types.ts";
import { getString } from "../utils/strings.ts";

// Language selection keyboard
export const languageKeyboard = new InlineKeyboard()
  .text("🇷🇺 Русский", "lang_ru")
  .text("🇬🇧 English", "lang_en")
  .text("🇨🇳 中文", "lang_zh")
  .row()
  .text("🇪🇸 Español", "lang_es")
  .text("🇫🇷 Français", "lang_fr")
  .text("🇩🇪 Deutsch", "lang_de")
  .row()
  .text("🇮🇹 Italiano", "lang_it")
  .text("🇵🇹 Português", "lang_pt");

// Main keyboard with task and word management buttons
export function mainKeyboard(lang: SupportedLanguage): InlineKeyboard {
  return new InlineKeyboard()
    .text(getString(lang, "GET_TASK_BUTTON"), "get_task")
    .text(getString(lang, "ADD_WORDS_BUTTON"), "add_words")
    .row()
    .text(getString(lang, "RESET_WORDS_BUTTON"), "reset_words");
}

// Admin keyboard with additional functionality
export function adminKeyboard(lang: SupportedLanguage): InlineKeyboard {
  return new InlineKeyboard()
    .text(getString(lang, "GET_TASK_BUTTON"), "get_task")
    .text(getString(lang, "ADD_WORDS_BUTTON"), "add_words")
    .row()
    .text(getString(lang, "RESET_WORDS_BUTTON"), "reset_words")
    .text(getString(lang, "ADMIN_STATS_BUTTON"), "admin_stats");
}
