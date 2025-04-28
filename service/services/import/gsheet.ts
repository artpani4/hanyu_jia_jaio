// service/services/import/gsheet.ts
import { BaseImportParser } from "./base.ts";
import { WordData } from "$types";

export class GoogleSheetParser extends BaseImportParser {
  async parse(url: string): Promise<WordData[]> {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error("Invalid Google Sheets URL");
    }
    const sheetId = match[1];

    const csvUrl =
      `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    // Используем CSV парсер
    const parser = new (await import("./csv.ts")).CSVParser();
    return parser.parse(csvText);
  }
}
