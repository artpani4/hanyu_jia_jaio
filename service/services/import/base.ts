// service/services/import/base.ts
import { WordData } from "$types";

export interface ImportParser {
  parse(data: string | Uint8Array): Promise<WordData[]>;
}

export abstract class BaseImportParser implements ImportParser {
  abstract parse(data: string | Uint8Array): Promise<WordData[]>;

  protected validateWord(word: any): word is WordData {
    return (
      typeof word.word === "string" &&
      typeof word.pinyin === "string" &&
      typeof word.hanzi === "string" &&
      typeof word.translation === "string" &&
      word.word.length > 0 &&
      word.pinyin.length > 0 &&
      word.hanzi.length > 0 &&
      word.translation.length > 0
    );
  }
}
