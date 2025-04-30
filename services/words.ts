// services/words.ts

import { kv } from "../shared.ts";
import { KVWord, WordData } from "../types.ts";
import { logger } from "../utils/logger.ts";

// Word storage and operations
export const wordService = {
  // Add words to KV storage
  async addWords(userId: string, words: WordData[]): Promise<number> {
    try {
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
      logger.info(`Added ${words.length} words for user ${userId}`);
      return words.length;
    } catch (e) {
      logger.error(
        `Error adding words: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw e;
    }
  },

  // Get all words for a user
  async getUserWords(userId: string): Promise<KVWord[]> {
    try {
      const words: KVWord[] = [];
      const entries = kv.list<KVWord>({ prefix: ["users", userId, "words"] });

      for await (const entry of entries) {
        words.push(entry.value);
      }

      logger.debug(`Retrieved ${words.length} words for user ${userId}`);
      return words;
    } catch (e) {
      logger.error(
        `Error getting user words: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw e;
    }
  },

  // Get words that have been used least (for tasks)
  async getLeastUsedWords(
    userId: string,
    limit: number = 10,
  ): Promise<KVWord[]> {
    try {
      const words = await this.getUserWords(userId);

      // Sort by usage count and last used date
      words.sort((a, b) => {
        if (a.times_used !== b.times_used) {
          return a.times_used - b.times_used;
        }
        if (!a.last_used_at) return -1;
        if (!b.last_used_at) return 1;
        return new Date(a.last_used_at).getTime() -
          new Date(b.last_used_at).getTime();
      });

      logger.debug(
        `Retrieved ${
          Math.min(limit, words.length)
        } least used words for user ${userId}`,
      );
      return words.slice(0, limit);
    } catch (e) {
      logger.error(
        `Error getting least used words: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw e;
    }
  },

  // Update word usage statistics
  async updateWordsUsage(userId: string, wordIds: string[]): Promise<void> {
    try {
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
      logger.info(
        `Updated usage for ${wordIds.length} words for user ${userId}`,
      );
    } catch (e) {
      logger.error(
        `Error updating word usage: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw e;
    }
  },

  // Get count of words for a user
  async getUserWordCount(userId: string): Promise<number> {
    try {
      let count = 0;
      const entries = kv.list({ prefix: ["users", userId, "words"] });

      for await (const _ of entries) {
        count++;
      }

      logger.debug(`User ${userId} has ${count} words`);
      return count;
    } catch (e) {
      logger.error(
        `Error getting word count: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw e;
    }
  },

  // Get word usage statistics
  async getWordStats(userId: string): Promise<{
    total: number;
    used: number;
    unused: number;
    topWords: { word: string; timesUsed: number }[];
  }> {
    try {
      const words = await this.getUserWords(userId);
      const total = words.length;
      const used = words.filter((w) => w.times_used > 0).length;
      const unused = total - used;

      // Get top 5 most used words
      const topWords = words
        .sort((a, b) => b.times_used - a.times_used)
        .slice(0, 5)
        .map((w) => ({
          word: `${w.hanzi} (${w.pinyin}) - ${w.translation}`,
          timesUsed: w.times_used,
        }));

      return { total, used, unused, topWords };
    } catch (e) {
      logger.error(
        `Error getting word stats: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw e;
    }
  },

  // Reset all words for a user
  async resetWords(userId: string): Promise<void> {
    try {
      const atomic = kv.atomic();
      const entries = kv.list({ prefix: ["users", userId, "words"] });

      for await (const entry of entries) {
        atomic.delete(entry.key);
      }

      await atomic.commit();
      logger.info(`Reset all words for user ${userId}`);
    } catch (e) {
      logger.error(
        `Error resetting words: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw e;
    }
  },

  // Get global stats for admin
  async getGlobalStats(): Promise<{
    usersCount: number;
    activeUsers: number;
    wordsCount: number;
    avgWordsPerUser: number;
  }> {
    try {
      // Get all users
      const userIds = new Set<string>();
      const userEntries = kv.list({ prefix: ["users"] });

      for await (const entry of userEntries) {
        if (entry.key.length >= 2) {
          userIds.add(String(entry.key[1])); // The user ID is the second component in the key
        }
      }

      // Count total words
      let wordsCount = 0;
      for (const userId of userIds) {
        wordsCount += await this.getUserWordCount(userId);
      }

      // Calculate average
      const usersCount = userIds.size;
      const avgWordsPerUser = usersCount > 0
        ? Math.round(wordsCount / usersCount)
        : 0;

      // For simplicity, active users is just the total users (would need timestamps in real app)
      const activeUsers = usersCount;

      return {
        usersCount,
        activeUsers,
        wordsCount,
        avgWordsPerUser,
      };
    } catch (e) {
      logger.error(
        `Error getting global stats: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw e;
    }
  },
};
