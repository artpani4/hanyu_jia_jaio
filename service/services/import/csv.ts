// service/services/import/csv.ts
import { BaseImportParser } from "./base.ts";
import { WordData } from "$types";

export class CSVParser extends BaseImportParser {
  async parse(data: string | Uint8Array): Promise<WordData[]> {
    const text = typeof data === "string"
      ? data
      : new TextDecoder().decode(data);
    const words: WordData[] = [];

    // Простой CSV парсер
    const lines = text.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Пропускаем заголовок, если он есть
    const startIndex = lines[0].toLowerCase().includes("word") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(",").map((part) => part.trim());

      if (parts.length >= 4) {
        const word: WordData = {
          word: parts[0],
          pinyin: parts[1],
          hanzi: parts[2],
          translation: parts[3],
        };

        if (this.validateWord(word)) {
          words.push(word);
        }
      }
    }

    return words;
  }
}
