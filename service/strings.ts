// service/strings.ts
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "./constants.ts";

type StringKey =
  | "WELCOME_MESSAGE"
  | "LANG_PICK"
  | "LANG_SELECTED"
  | "ADD_WORDS_INSTRUCTION"
  | "TASK_BUTTON"
  | "GET_TASK_BUTTON"
  | "NO_WORDS_ERROR"
  | "TASK_PROMPT"
  | "WORDS_ADDED"
  | "WORDS_IMPORT_ERROR"
  | "TASK_GENERATION_ERROR"
  | "GENERATING_TASK_MESSAGE"
  | "HELP_MESSAGE";

type LocalizedStrings = {
  [K in StringKey]: string;
};

type StringsMap = {
  [L in SupportedLanguage]: LocalizedStrings;
};

export const STRINGS: StringsMap = {
  ru: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 Добро пожаловать в бот для изучения китайского языка!\n\nВыберите язык интерфейса:",
    LANG_PICK: "🌍 Выберите язык",
    LANG_SELECTED: "✅ Язык интерфейса изменен",
    ADD_WORDS_INSTRUCTION:
      "📚 Теперь добавьте слова для изучения. Отправьте текст в формате:\nслово|пиньинь|иероглиф|перевод\n\nПример:\nhello|nǐ hǎo|你好|привет",
    TASK_BUTTON: "📝 Получить задание",
    GET_TASK_BUTTON: "📝 Получить новое задание",
    NO_WORDS_ERROR:
      "⚠️ У вас пока нет добавленных слов. Добавьте слова для изучения!",
    TASK_PROMPT: "✨ Переведите следующие предложения на китайский:",
    WORDS_ADDED: "✅ Слова успешно добавлены!",
    WORDS_IMPORT_ERROR:
      "❌ Ошибка при импорте слов. Проверьте формат и попробуйте еще раз.",
    TASK_GENERATION_ERROR: "❌ Ошибка при генерации задания. Попробуйте позже.",
    HELP_MESSAGE:
      "ℹ️ Команды бота:\n/start - Начать работу\n/language - Сменить язык\n/help - Показать помощь\n\nФормат добавления слов:\nслово|пиньинь|иероглиф|перевод",
  },
  en: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 Welcome to the Chinese language learning bot!\n\nSelect interface language:",
    LANG_PICK: "🌍 Choose language",
    LANG_SELECTED: "✅ Interface language changed",
    ADD_WORDS_INSTRUCTION:
      "📚 Now add words to study. Send text in format:\nword|pinyin|character|translation\n\nExample:\nhello|nǐ hǎo|你好|привет",
    TASK_BUTTON: "📝 Get task",
    GET_TASK_BUTTON: "📝 Get new task",
    NO_WORDS_ERROR:
      "⚠️ You don't have any words added yet. Add words to study!",
    TASK_PROMPT: "✨ Translate the following sentences into Chinese:",
    WORDS_ADDED: "✅ Words successfully added!",
    WORDS_IMPORT_ERROR: "❌ Error importing words. Check format and try again.",
    TASK_GENERATION_ERROR: "❌ Error generating task. Please try later.",
    HELP_MESSAGE:
      "ℹ️ Bot commands:\n/start - Start\n/language - Change language\n/help - Show help\n\nWord addition format:\nword|pinyin|character|translation",
  },
  zh: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE: "👋 欢迎使用中文学习机器人！\n\n选择界面语言：",
    LANG_PICK: "🌍 选择语言",
    LANG_SELECTED: "✅ 界面语言已更改",
    ADD_WORDS_INSTRUCTION:
      "📚 现在添加要学习的单词。按以下格式发送文本：\n单词|拼音|汉字|翻译\n\n示例：\nhello|nǐ hǎo|你好|привет",
    TASK_BUTTON: "📝 获取任务",
    GET_TASK_BUTTON: "📝 获取新任务",
    NO_WORDS_ERROR: "⚠️ 您还没有添加任何单词。请添加要学习的单词！",
    TASK_PROMPT: "✨ 将以下句子翻译成中文：",
    WORDS_ADDED: "✅ 单词已成功添加！",
    WORDS_IMPORT_ERROR: "❌ 导入单词时出错。请检查格式并重试。",
    TASK_GENERATION_ERROR: "❌ 生成任务时出错。请稍后再试。",
    HELP_MESSAGE:
      "ℹ️ 机器人命令：\n/start - 开始\n/language - 更改语言\n/help - 显示帮助\n\n添加单词格式：\n单词|拼音|汉字|翻译",
  },
  // Остальные языки - базовый английский
  es: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 ¡Bienvenido al bot para aprender chino!\n\nSelecciona el idioma de la interfaz:",
    LANG_PICK: "🌍 Elige idioma",
    LANG_SELECTED: "✅ Idioma de interfaz cambiado",
    ADD_WORDS_INSTRUCTION:
      "📚 Ahora añade palabras para estudiar. Envía texto en formato:\npalabra|pinyin|carácter|traducción\n\nEjemplo:\nhello|nǐ hǎo|你好|hola",
    TASK_BUTTON: "📝 Obtener tarea",
    GET_TASK_BUTTON: "📝 Obtener nueva tarea",
    NO_WORDS_ERROR:
      "⚠️ Todavía no tienes palabras añadidas. ¡Añade palabras para estudiar!",
    TASK_PROMPT: "✨ Traduce las siguientes oraciones al chino:",
    WORDS_ADDED: "✅ ¡Palabras añadidas con éxito!",
    WORDS_IMPORT_ERROR:
      "❌ Error al importar palabras. Verifica el formato e inténtalo de nuevo.",
    TASK_GENERATION_ERROR: "❌ Error al generar la tarea. Inténtalo más tarde.",
    HELP_MESSAGE:
      "ℹ️ Comandos del bot:\n/start - Iniciar\n/language - Cambiar idioma\n/help - Mostrar ayuda\n\nFormato para añadir palabras:\npalabra|pinyin|carácter|traducción",
  },
  fr: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 Bienvenue dans le bot d'apprentissage du chinois !\n\nSélectionnez la langue de l'interface :",
    LANG_PICK: "🌍 Choisissez la langue",
    LANG_SELECTED: "✅ Langue de l'interface modifiée",
    ADD_WORDS_INSTRUCTION:
      "📚 Ajoutez maintenant des mots à étudier. Envoyez du texte au format :\nmot|pinyin|caractère|traduction\n\nExemple :\nhello|nǐ hǎo|你好|bonjour",
    TASK_BUTTON: "📝 Obtenir un exercice",
    GET_TASK_BUTTON: "📝 Obtenir un nouvel exercice",
    NO_WORDS_ERROR:
      "⚠️ Vous n'avez pas encore ajouté de mots. Ajoutez des mots à étudier !",
    TASK_PROMPT: "✨ Traduisez les phrases suivantes en chinois :",
    WORDS_ADDED: "✅ Mots ajoutés avec succès !",
    WORDS_IMPORT_ERROR:
      "❌ Erreur lors de l'importation des mots. Vérifiez le format et réessayez.",
    TASK_GENERATION_ERROR:
      "❌ Erreur lors de la génération de l'exercice. Veuillez réessayer plus tard.",
    HELP_MESSAGE:
      "ℹ️ Commandes du bot :\n/start - Démarrer\n/language - Changer la langue\n/help - Afficher l'aide\n\nFormat pour ajouter des mots :\nmot|pinyin|caractère|traduction",
  },
  de: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 Willkommen beim Chinesisch-Lernbot!\n\nWählen Sie die Schnittstellensprache:",
    LANG_PICK: "🌍 Sprache wählen",
    LANG_SELECTED: "✅ Schnittstellensprache geändert",
    ADD_WORDS_INSTRUCTION:
      "📚 Fügen Sie jetzt Wörter zum Lernen hinzu. Senden Sie Text im Format:\nWort|Pinyin|Zeichen|Übersetzung\n\nBeispiel:\nhello|nǐ hǎo|你好|hallo",
    TASK_BUTTON: "📝 Aufgabe erhalten",
    GET_TASK_BUTTON: "📝 Neue Aufgabe erhalten",
    NO_WORDS_ERROR:
      "⚠️ Sie haben noch keine Wörter hinzugefügt. Fügen Sie Wörter zum Lernen hinzu!",
    TASK_PROMPT: "✨ Übersetzen Sie die folgenden Sätze ins Chinesische:",
    WORDS_ADDED: "✅ Wörter erfolgreich hinzugefügt!",
    WORDS_IMPORT_ERROR:
      "❌ Fehler beim Importieren der Wörter. Überprüfen Sie das Format und versuchen Sie es erneut.",
    TASK_GENERATION_ERROR:
      "❌ Fehler bei der Aufgabengenerierung. Bitte versuchen Sie es später erneut.",
    HELP_MESSAGE:
      "ℹ️ Bot-Befehle:\n/start - Starten\n/language - Sprache ändern\n/help - Hilfe anzeigen\n\nFormat zum Hinzufügen von Wörtern:\nWort|Pinyin|Zeichen|Übersetzung",
  },
  it: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 Benvenuto nel bot per l'apprendimento del cinese!\n\nSeleziona la lingua dell'interfaccia:",
    LANG_PICK: "🌍 Scegli la lingua",
    LANG_SELECTED: "✅ Lingua dell'interfaccia modificata",
    ADD_WORDS_INSTRUCTION:
      "📚 Ora aggiungi parole da studiare. Invia testo nel formato:\nparola|pinyin|carattere|traduzione\n\nEsempio:\nhello|nǐ hǎo|你好|ciao",
    TASK_BUTTON: "📝 Ottieni compito",
    GET_TASK_BUTTON: "📝 Ottieni nuovo compito",
    NO_WORDS_ERROR:
      "⚠️ Non hai ancora aggiunto parole. Aggiungi parole da studiare!",
    TASK_PROMPT: "✨ Traduci le seguenti frasi in cinese:",
    WORDS_ADDED: "✅ Parole aggiunte con successo!",
    WORDS_IMPORT_ERROR:
      "❌ Errore durante l'importazione delle parole. Controlla il formato e riprova.",
    TASK_GENERATION_ERROR:
      "❌ Errore durante la generazione del compito. Riprova più tardi.",
    HELP_MESSAGE:
      "ℹ️ Comandi del bot:\n/start - Avvia\n/language - Cambia lingua\n/help - Mostra aiuto\n\nFormato per aggiungere parole:\nparola|pinyin|carattere|traduzione",
  },
  pt: {
    GENERATING_TASK_MESSAGE: "⏳ Генерирую задание, пожалуйста, подождите...",
    WELCOME_MESSAGE:
      "👋 Bem-vindo ao bot de aprendizagem de chinês!\n\nSelecione o idioma da interface:",
    LANG_PICK: "🌍 Escolha o idioma",
    LANG_SELECTED: "✅ Idioma da interface alterado",
    ADD_WORDS_INSTRUCTION:
      "📚 Agora adicione palavras para estudar. Envie texto no formato:\npalavra|pinyin|caractere|tradução\n\nExemplo:\nhello|nǐ hǎo|你好|olá",
    TASK_BUTTON: "📝 Obter tarefa",
    GET_TASK_BUTTON: "📝 Obter nova tarefa",
    NO_WORDS_ERROR:
      "⚠️ Você ainda não adicionou palavras. Adicione palavras para estudar!",
    TASK_PROMPT: "✨ Traduza as seguintes frases para o chinês:",
    WORDS_ADDED: "✅ Palavras adicionadas com sucesso!",
    WORDS_IMPORT_ERROR:
      "❌ Erro ao importar palavras. Verifique o formato e tente novamente.",
    TASK_GENERATION_ERROR:
      "❌ Erro ao gerar tarefa. Tente novamente mais tarde.",
    HELP_MESSAGE:
      "ℹ️ Comandos do bot:\n/start - Iniciar\n/language - Mudar idioma\n/help - Mostrar ajuda\n\nFormato para adicionar palavras:\npalavra|pinyin|caractere|tradução",
  },
};

export function detectLang(langCode?: string): SupportedLanguage {
  if (!langCode) return "en";

  const shortCode = langCode.toLowerCase().substring(0, 2);

  if (SUPPORTED_LANGUAGES.includes(shortCode as SupportedLanguage)) {
    return shortCode as SupportedLanguage;
  }

  return "en";
}

export function getString(lang: SupportedLanguage, key: StringKey): string {
  return STRINGS[lang][key] || STRINGS["en"][key];
}
