// utils/strings.ts
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../types.ts";

// String keys for localization
type StringKey =
  | "WELCOME_MESSAGE"
  | "LANG_PICK"
  | "LANG_SELECTED"
  | "ADD_WORDS_INSTRUCTION"
  | "GET_TASK_BUTTON"
  | "NO_WORDS_ERROR"
  | "TASK_PROMPT"
  | "WORDS_ADDED"
  | "WORDS_IMPORT_ERROR"
  | "TASK_GENERATION_ERROR"
  | "HELP_MESSAGE"
  | "STATS_MESSAGE"
  | "STATS_NO_WORDS";

const DEFAULT_STRINGS: Record<StringKey, string> = {
  WELCOME_MESSAGE:
    "👋 Welcome to the Chinese language learning bot!\n\nSelect interface language:",
  LANG_PICK: "🌍 Choose language",
  LANG_SELECTED: "✅ Interface language changed",
  ADD_WORDS_INSTRUCTION:
    "📚 Now add words to study. Send text in format:\nword|pinyin|character|translation\n\nExample:\nhello|nǐ hǎo|你好|hello",
  GET_TASK_BUTTON: "📝 Get new task",
  NO_WORDS_ERROR: "⚠️ You don't have any words added yet. Add words to study!",
  TASK_PROMPT: "✨ Translate the following sentences into Chinese:",
  WORDS_ADDED: "✅ Words successfully added!",
  WORDS_IMPORT_ERROR: "❌ Error importing words. Check format and try again.",
  TASK_GENERATION_ERROR: "❌ Error generating task. Please try later.",
  HELP_MESSAGE:
    "ℹ️ Bot commands:\n/start - Start\n/language - Change language\n/help - Show help\n/stats - Show word statistics\n\nWord addition format:\nword|pinyin|character|translation",
  STATS_MESSAGE:
    "📊 Your word statistics:\n\nTotal words: {total}\nUsed in tasks: {used}\nNot yet used: {unused}\n\nYour most used words:\n{top_words}",
  STATS_NO_WORDS: "⚠️ You don't have any words added yet to show statistics.",
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
    NO_WORDS_ERROR:
      "⚠️ У вас пока нет добавленных слов. Добавьте слова для изучения!",
    TASK_PROMPT: "✨ Переведите следующие предложения на китайский:",
    WORDS_ADDED: "✅ Слова успешно добавлены!",
    WORDS_IMPORT_ERROR:
      "❌ Ошибка при импорте слов. Проверьте формат и попробуйте еще раз.",
    TASK_GENERATION_ERROR: "❌ Ошибка при генерации задания. Попробуйте позже.",
    HELP_MESSAGE:
      "ℹ️ Команды бота:\n/start - Начать работу\n/language - Сменить язык\n/help - Показать помощь\n/stats - Показать статистику слов\n\nФормат добавления слов:\nслово|пиньинь|иероглиф|перевод",
    STATS_MESSAGE:
      "📊 Статистика ваших слов:\n\nВсего слов: {total}\nИспользовано в заданиях: {used}\nЕще не использовано: {unused}\n\nСлова, которые вы использовали больше всего:\n{top_words}",
    STATS_NO_WORDS:
      "⚠️ У вас пока нет добавленных слов для отображения статистики.",
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
