// service/services/kv/words.ts
import { WordData } from "$types";

const kv = await Deno.openKv();

export interface KVWord extends WordData {
  id: string;
  times_used: number;
  last_used_at?: string;
}

export async function addWords(userId: string, words: WordData[]) {
  const atomic = kv.atomic();

  for (const word of words) {
    const id = crypto.randomUUID();
    const key = ["users", userId, "words", id];
    const kvWord: KVWord = {
      ...word,
      id,
      times_used: 0,
      last_used_at: undefined,
    };
    atomic.set(key, kvWord);
  }

  await atomic.commit();

  return words.length;
}

export async function getUserWords(userId: string): Promise<KVWord[]> {
  const words: KVWord[] = [];
  const entries = kv.list<KVWord>({ prefix: ["users", userId, "words"] });

  for await (const entry of entries) {
    const word = entry.value;
    // Получаем ID из ключа
    const id = entry.key[3] as string;
    words.push({ ...word, id });
  }

  return words;
}

export async function getLeastUsedWords(
  userId: string,
  limit: number = 10,
): Promise<KVWord[]> {
  const words = await getUserWords(userId);

  // Сортируем по times_used и last_used_at
  words.sort((a, b) => {
    if (a.times_used !== b.times_used) {
      return a.times_used - b.times_used;
    }
    if (!a.last_used_at) return -1;
    if (!b.last_used_at) return 1;
    return new Date(a.last_used_at).getTime() -
      new Date(b.last_used_at).getTime();
  });

  return words.slice(0, limit);
}

export async function updateWordsUsage(userId: string, wordIds: string[]) {
  const atomic = kv.atomic();
  const now = new Date().toISOString();

  for (const wordId of wordIds) {
    const key = ["users", userId, "words", wordId];
    const entry = await kv.get<KVWord>(key);

    if (entry.value) {
      const updatedWord: KVWord = {
        ...entry.value,
        times_used: entry.value.times_used + 1,
        last_used_at: now,
      };
      atomic.set(key, updatedWord);
    }
  }

  await atomic.commit();
}

export async function getUserWordCount(userId: string): Promise<number> {
  let count = 0;
  const entries = kv.list({ prefix: ["users", userId, "words"] });

  for await (const _ of entries) {
    count++;
  }

  return count;
}
