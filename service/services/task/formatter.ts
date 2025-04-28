// service/services/task/formatter.ts
import { SupportedLanguage } from "$constants";
import { getString } from "$strings";

export function formatTaskMessage(
  sentences: string[],
  language: SupportedLanguage,
): string {
  const header = getString(language, "TASK_PROMPT");
  const sentenceList = sentences.map((s, i) => `${i + 1}. ${s}`).join("\n");

  return [header, "", sentenceList].join("\n");
}

export function formatWordsForDisplay(
  words: { word: string; pinyin: string; hanzi: string }[],
): string {
  return words.map((w) => `${w.hanzi} (${w.pinyin}) - ${w.word}`).join("\n");
}
