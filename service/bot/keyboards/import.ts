// service/bot/keyboards/import.ts
import { InlineKeyboard } from "@grammy";

export function importOptionsKeyboard() {
  return new InlineKeyboard()
    .text("📄 Вставить текст", "import_text")
    .text("📁 Загрузить CSV", "import_csv")
    .row()
    .text("🔗 Google Sheets", "import_gsheet")
    .text("🔗 Notion", "import_notion");
}
