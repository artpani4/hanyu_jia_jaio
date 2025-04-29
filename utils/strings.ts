// utils/strings.ts
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../types.ts";

// String keys for localization
type StringKey =
  | "WELCOME_MESSAGE"
  | "LANG_PICK"
  | "LANG_SELECTED"
  | "ADD_WORDS_INSTRUCTION"
  | "GET_TASK_BUTTON"
  | "ADD_WORDS_BUTTON"
  | "RESET_WORDS_BUTTON"
  | "ADMIN_STATS_BUTTON"
  | "NO_WORDS_ERROR"
  | "TASK_PROMPT"
  | "WORDS_ADDED"
  | "WORDS_IMPORT_ERROR"
  | "TASK_GENERATION_ERROR"
  | "HELP_MESSAGE"
  | "STATS_MESSAGE"
  | "STATS_NO_WORDS"
  | "RESET_CONFIRMATION"
  | "CONFIRM_YES"
  | "CONFIRM_NO"
  | "RESET_SUCCESS"
  | "RESET_CANCELED"
  | "ADMIN_STATS_MESSAGE";

const DEFAULT_STRINGS: Record<StringKey, string> = {
  WELCOME_MESSAGE:
    "👋 Welcome to the Chinese language learning bot!\n\nSelect interface language:",
  LANG_PICK: "🌍 Choose language",
  LANG_SELECTED: "✅ Interface language changed",
  ADD_WORDS_INSTRUCTION:
    "📚 Now add words to study. Send text in format:\nword|pinyin|character|translation\n\nExample:\nhello|nǐ hǎo|你好|hello",
  GET_TASK_BUTTON: "📝 Get new task",
  ADD_WORDS_BUTTON: "📌 Add words",
  RESET_WORDS_BUTTON: "🔄 Reset words",
  ADMIN_STATS_BUTTON: "📊 Admin Stats",
  NO_WORDS_ERROR: "⚠️ You don't have any words added yet. Add words to study!",
  TASK_PROMPT: "✨ Practice with these sentences:",
  WORDS_ADDED: "✅ Words successfully added!",
  WORDS_IMPORT_ERROR: "❌ Error importing words. Check format and try again.",
  TASK_GENERATION_ERROR: "❌ Error generating task. Please try later.",
  HELP_MESSAGE:
    "ℹ️ Bot commands:\n/start - Start\n/language - Change language\n/help - Show help\n/stats - Show word statistics\n/reset - Reset all your words\n\nWord addition format:\nword|pinyin|character|translation",
  STATS_MESSAGE:
    "📊 Your word statistics:\n\nTotal words: {total}\nUsed in tasks: {used}\nNot yet used: {unused}\n\nYour most used words:\n{top_words}",
  STATS_NO_WORDS: "⚠️ You don't have any words added yet to show statistics.",
  RESET_CONFIRMATION:
    "⚠️ Are you sure you want to delete all your words? This action cannot be undone.",
  CONFIRM_YES: "Yes, delete all",
  CONFIRM_NO: "No, keep my words",
  RESET_SUCCESS:
    "✅ All your words have been deleted. You can start adding new words now.",
  RESET_CANCELED: "✅ Operation canceled. Your words are safe.",
  ADMIN_STATS_MESSAGE:
    "📊 Admin Statistics:\n\nTotal users: {users_count}\nActive users (last 7 days): {active_users}\nTotal words: {words_count}\nAverage words per user: {avg_words}",
};

// Localized strings map
const STRINGS: Record<SupportedLanguage, Record<StringKey, string>> = {
  en: DEFAULT_STRINGS,
  ru: {
    WELCOME_MESSAGE:
      "👋 Добро пожаловать в бот для изучения китайского языка!\n\nВыберите язык интерфейса:",
    LANG_PICK: "🌍 Выберите язык",
    LANG_SELECTED: "✅ Язык интерфейса изменен",
    ADD_WORDS_INSTRUCTION:
      "📚 Теперь добавьте слова для изучения. Отправьте текст в формате:\nслово|пиньинь|иероглиф|перевод\n\nПример:\nhello|nǐ hǎo|你好|привет",
    GET_TASK_BUTTON: "📝 Получить новое задание",
    ADD_WORDS_BUTTON: "📌 Добавить слова",
    RESET_WORDS_BUTTON: "🔄 Сбросить слова",
    ADMIN_STATS_BUTTON: "📊 Статистика админа",
    NO_WORDS_ERROR:
      "⚠️ У вас пока нет добавленных слов. Добавьте слова для изучения!",
    TASK_PROMPT: "✨ Потренируйтесь с этими предложениями:",
    WORDS_ADDED: "✅ Слова успешно добавлены!",
    WORDS_IMPORT_ERROR:
      "❌ Ошибка при импорте слов. Проверьте формат и попробуйте еще раз.",
    TASK_GENERATION_ERROR: "❌ Ошибка при генерации задания. Попробуйте позже.",
    HELP_MESSAGE:
      "ℹ️ Команды бота:\n/start - Начать работу\n/language - Сменить язык\n/help - Показать помощь\n/stats - Показать статистику слов\n/reset - Сбросить все ваши слова\n\nФормат добавления слов:\nслово|пиньинь|иероглиф|перевод",
    STATS_MESSAGE:
      "📊 Статистика ваших слов:\n\nВсего слов: {total}\nИспользовано в заданиях: {used}\nЕще не использовано: {unused}\n\nСлова, которые вы использовали больше всего:\n{top_words}",
    STATS_NO_WORDS:
      "⚠️ У вас пока нет добавленных слов для отображения статистики.",
    RESET_CONFIRMATION:
      "⚠️ Вы уверены, что хотите удалить все ваши слова? Это действие нельзя отменить.",
    CONFIRM_YES: "Да, удалить все",
    CONFIRM_NO: "Нет, сохранить слова",
    RESET_SUCCESS:
      "✅ Все ваши слова были удалены. Вы можете начать добавлять новые слова.",
    RESET_CANCELED: "✅ Операция отменена. Ваши слова в безопасности.",
    ADMIN_STATS_MESSAGE:
      "📊 Статистика администратора:\n\nВсего пользователей: {users_count}\nАктивных пользователей (последние 7 дней): {active_users}\nВсего слов: {words_count}\nСреднее количество слов на пользователя: {avg_words}",
  },
  // Simplified for this example - we'll include English and Russian only
  // with placeholders for other languages
  zh: { ...getDefaultStrings() },
  es: { ...getDefaultStrings() },
  fr: { ...getDefaultStrings() },
  de: { ...getDefaultStrings() },
  it: { ...getDefaultStrings() },
  pt: { ...getDefaultStrings() },
};

// Default strings function now uses the separate constant
function getDefaultStrings(): Record<StringKey, string> {
  return { ...DEFAULT_STRINGS };
}

// Detect user language from Telegram language code
export function detectLang(langCode?: string): SupportedLanguage {
  if (!langCode) return "en";

  const shortCode = langCode.toLowerCase().substring(0, 2) as SupportedLanguage;

  return SUPPORTED_LANGUAGES.includes(shortCode) ? shortCode : "en";
}

// Get a localized string
export function getString(
  lang: SupportedLanguage,
  key: StringKey,
  params?: Record<string, string | number>,
): string {
  let text = STRINGS[lang][key] || STRINGS.en[key];

  // Replace parameters if provided
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(`{${paramKey}}`, String(paramValue));
    }
  }

  return text;
}
