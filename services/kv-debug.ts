// services/kv-debug.ts
import { kv } from "../shared.ts";
import { KVUser, KVWord } from "../types.ts";

/**
 * A simple debugging tool for viewing the content of the KV database
 */
async function debugKvDatabase() {
  console.log("=== DEBUG: EXAMINING KV DATABASE STRUCTURE ===");

  // Get all keys from the database
  const allEntries = kv.list({ prefix: [] });
  const keysStructure: Record<string, Set<string>> = {};

  console.log("Found keys:");
  for await (const entry of allEntries) {
    const keyPath = entry.key.join(" > ");
    console.log(
      `Key: [${
        entry.key.map((k) => typeof k === "string" ? `"${k}"` : k).join(", ")
      }]`,
    );

    // Analyze key structure
    if (entry.key.length > 0) {
      const prefix = String(entry.key[0]);
      if (!keysStructure[prefix]) {
        keysStructure[prefix] = new Set();
      }

      // Save key pattern (with types instead of values)
      const keyPattern = entry.key.map((k) => typeof k).join(",");
      keysStructure[prefix].add(keyPattern);
    }

    // Log value information
    if (entry.value === null) {
      console.log("Value: null");
    } else if (typeof entry.value === "object") {
      console.log(
        `Value type: Object with keys: [${
          Object.keys(entry.value).join(", ")
        }]`,
      );
      if ("id" in entry.value) console.log(`ID: ${entry.value.id}`);
      if ("telegram_id" in entry.value) {
        console.log(`Telegram ID: ${entry.value.telegram_id}`);
      }
      if ("username" in entry.value) {
        console.log(`Username: ${entry.value.username}`);
      }
      if ("word" in entry.value) console.log(`Word: ${entry.value.word}`);
    } else {
      console.log(`Value: ${entry.value}`);
    }
    console.log("-----------------");
  }

  // Key pattern analysis
  console.log("\n=== KEY PATTERN ANALYSIS ===");
  for (const [prefix, patterns] of Object.entries(keysStructure)) {
    console.log(`Prefix "${prefix}" has the following key patterns:`);
    patterns.forEach((pattern) => console.log(`  - [${pattern}]`));
  }

  // Find users
  console.log("\n=== USERS ===");
  const usersEntries = kv.list<KVUser>({ prefix: ["users"] });
  let userCount = 0;

  for await (const entry of usersEntries) {
    // Only main user entries have key length of 2 (["users", "telegramId"])
    if (
      entry.key.length === 2 && entry.value &&
      typeof entry.value === "object" && "telegram_id" in entry.value
    ) {
      userCount++;
      console.log(`User ${userCount}:`);
      console.log(`  Key: [${entry.key.join(", ")}]`);
      console.log(`  Telegram ID: ${entry.value.telegram_id}`);
      console.log(`  Username: ${entry.value.username}`);
      console.log(`  Language: ${entry.value.language}`);
      console.log(`  Created: ${entry.value.created_at}`);
      console.log(`  Updated: ${entry.value.updated_at}`);
    }
  }
  console.log(`Total users found: ${userCount}`);

  // Word storage analysis
  console.log("\n=== WORD STORAGE ANALYSIS ===");
  // Find user with most words
  let maxWords = 0;
  let userWithMostWords: string | null = null;

  const userIds = new Set<string>();
  const usersForWords = kv.list({ prefix: ["users"] });
  for await (const entry of usersForWords) {
    if (entry.key.length === 2) {
      userIds.add(String(entry.key[1]));
    }
  }

  for (const userId of userIds) {
    const wordsCount = await countUserWords(userId);
    console.log(`User ${userId} has ${wordsCount} words`);

    if (wordsCount > maxWords) {
      maxWords = wordsCount;
      userWithMostWords = userId;
    }
  }

  console.log(
    `\nUser with most words: ${userWithMostWords} (${maxWords} words)`,
  );

  if (userWithMostWords) {
    console.log("\nSample word structure:");
    const wordEntries = kv.list<KVWord>({
      prefix: ["users", userWithMostWords, "words"],
    });
    let count = 0;

    for await (const entry of wordEntries) {
      if (count < 3) { // Show only the first 3 words
        console.log(`Word ${count + 1}:`);
        console.log(
          `  Key: [${
            entry.key.map((k) => typeof k === "string" ? `"${k}"` : k).join(
              ", ",
            )
          }]`,
        );
        console.log(`  Value: ${JSON.stringify(entry.value, null, 2)}`);
        count++;
      } else {
        break;
      }
    }
  }
}

async function countUserWords(userId: string): Promise<number> {
  let count = 0;
  const entries = kv.list({ prefix: ["users", userId, "words"] });

  for await (const _ of entries) {
    count++;
  }

  return count;
}

// Run debug
console.log("Starting KV database debug...");
await debugKvDatabase();
console.log("Debug completed.");
