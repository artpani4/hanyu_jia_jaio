// service/services/import/notion.ts
import { BaseImportParser } from "./base.ts";
import { WordData } from "$types";
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";

export class NotionParser extends BaseImportParser {
  private notion: Client;

  constructor() {
    super();
    const token = Deno.env.get("NOTION_TOKEN");
    if (!token) {
      throw new Error("NOTION_TOKEN is missing in environment");
    }
    this.notion = new Client({ auth: token });
  }

  async parse(url: string): Promise<WordData[]> {
    const databaseId = this.getPageIdByURL(url);
    if (!databaseId) {
      throw new Error("Invalid Notion URL");
    }

    const entries = await this.getDatabaseEntries(databaseId);
    const words: WordData[] = [];

    for (const entry of entries) {
      if (entry.hieroglyph && entry.pinyin && entry.translation) {
        words.push({
          word: entry.translation,
          pinyin: entry.pinyin,
          hanzi: entry.hieroglyph,
          translation: entry.translation,
        });
      }
    }

    return words;
  }

  private async getDatabaseEntries(databaseId: string) {
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
      });

      return response.results.map((entry: any) => ({
        id: entry.id,
        hieroglyph: entry.properties["Hanzi"]?.title?.[0]?.text?.content || "",
        pinyin: entry.properties["Pinyin"]?.rich_text?.[0]?.text?.content || "",
        translation: entry.properties["Перевод"]?.rich_text?.[0]?.text
          ?.content || "",
      }));
    } catch (error) {
      console.error("❌ Ошибка при получении данных из Notion:", error);
      return [];
    }
  }

  private getPageIdByURL(url: string): string | null {
    const match = url.match(/\/([\w-]+)\?/);
    if (match && match[1]) {
      const parts = match[1].split("-");
      return parts.length > 1 ? parts[parts.length - 1] : match[1];
    }
    return null;
  }
}
