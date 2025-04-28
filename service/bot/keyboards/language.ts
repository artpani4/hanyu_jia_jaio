// service/bot/keyboards/language.ts
import { InlineKeyboard } from "@grammy";

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
