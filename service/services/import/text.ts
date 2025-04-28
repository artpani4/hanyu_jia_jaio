// service/services/import/text.ts
import { BaseImportParser } from "./base.ts";
import { WordData } from "$types";
import { DEFAULT_WORD_FORMAT } from "$constants";
import luminous from "@vseplet/luminous";

const logger = new luminous.Logger(
  new luminous.OptionsBuilder().setName("text-parser").build(),
);

export class TextParser extends BaseImportParser {
  async parse(data: string): Promise<WordData[]> {
    const words: WordData[] = [];
    const lines = data.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    logger.dbg(`Парсинг ${lines.length} строк текста`);

    for (const line of lines) {
      const parts = line.split(DEFAULT_WORD_FORMAT.separator)
        .map((part) => part.trim());

      logger.dbg(`Парсинг строки: ${line}, получено частей: ${parts.length}`);

      // Обработка 4-х частей (стандартный формат)
      if (parts.length === 4) {
        const word: WordData = {
          word: parts[3], // перевод
          pinyin: parts[1], // пиньинь
          hanzi: parts[0], // иероглиф
          translation: parts[3], // перевод (дублируется для соответствия интерфейсу)
        };

        if (this.validateWord(word)) {
          words.push(word);
          logger.dbg(`Слово добавлено: ${JSON.stringify(word)}`);
        } else {
          logger.wrn(`Недопустимое слово в формате 4 частей: ${line}`);
        }
      } // Обработка 3-х частей (иероглиф|пиньинь|перевод)
      else if (parts.length === 3) {
        const word: WordData = {
          word: parts[2], // перевод
          pinyin: parts[1], // пиньинь
          hanzi: parts[0], // иероглиф
          translation: parts[2], // перевод
        };

        if (this.validateWord(word)) {
          words.push(word);
          logger.dbg(`Слово добавлено (3 части): ${JSON.stringify(word)}`);
        } else {
          logger.wrn(`Недопустимое слово в формате 3 частей: ${line}`);
        }
      } else {
        logger.wrn(
          `Строка с неверным количеством частей (${parts.length}): ${line}`,
        );
      }
    }

    logger.inf(`Всего успешно распарсено слов: ${words.length}`);
    return words;
  }

  // Переопределим метод валидации для более мягкой проверки
  protected override validateWord(word: any): word is WordData {
    const isValid = (
      typeof word.word === "string" &&
      typeof word.pinyin === "string" &&
      typeof word.hanzi === "string" &&
      typeof word.translation === "string" &&
      word.hanzi.length > 0 && // Самое важное - иероглиф должен быть
      word.pinyin.length > 0 // И пиньинь тоже должен быть
    );

    if (!isValid) {
      logger.dbg(`Невалидное слово: ${JSON.stringify(word)}`);
    }

    return isValid;
  }
}
