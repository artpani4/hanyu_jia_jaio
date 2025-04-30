// services/db.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { ENV } from "../config/mod.ts";
import { KVUser, SupportedLanguage, User } from "../types.ts";
import { logger } from "../utils/logger.ts";
import { kv } from "../shared.ts";

// Initialize Supabase client
const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
  db: {
    schema: ENV.SUPABASE_SCHEMA,
  },
});

// User-related database operations
export const userDb = {
  // Create or update a user - use both Supabase and KV
  async upsertUser(
    telegram_id: number,
    data: { username?: string; language?: SupportedLanguage },
  ) {
    try {
      // First, check if user exists in KV
      const kvUser = await this.getUserFromKV(telegram_id);

      // Write to Supabase for backup and analytics purposes
      const { data: user, error } = await supabase
        .from("users")
        .upsert({
          telegram_id,
          ...data,
        }, { onConflict: "telegram_id" })
        .select()
        .single();

      if (error) {
        logger.error(`Error upserting user in Supabase: ${error.message}`);
        // Continue anyway - we'll use KV primarily
      }

      // Create or update user in KV
      const kvUserData: KVUser = {
        telegram_id,
        username: data.username || kvUser?.username || null,
        language: data.language || kvUser?.language || "en",
        created_at: kvUser?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save user to KV
      await kv.set(["users", telegram_id.toString()], kvUserData);

      logger.info(`User ${telegram_id} upserted in KV and Supabase`);
      return [kvUserData, null] as const;
    } catch (e) {
      logger.error(
        `Exception in upsertUser: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },

  // Get a user by Telegram ID - primarily from KV, fallback to Supabase
  async getUserByTelegramId(telegram_id: number) {
    try {
      // First, try to get from KV
      const kvUser = await this.getUserFromKV(telegram_id);

      if (kvUser) {
        return [kvUser, null] as const;
      }

      // If not in KV, try Supabase and then cache in KV
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", telegram_id)
        .single();

      if (error) {
        logger.error(`Error getting user from Supabase: ${error.message}`);
        return [null, error] as const;
      }

      // Cache in KV
      if (user) {
        const kvUser: KVUser = {
          telegram_id: user.telegram_id,
          username: user.username,
          language: user.language,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString(),
        };

        await kv.set(["users", telegram_id.toString()], kvUser);
        logger.info(`User ${telegram_id} cached in KV from Supabase`);

        return [kvUser, null] as const;
      }

      return [null, new Error("User not found")] as const;
    } catch (e) {
      logger.error(
        `Exception in getUserByTelegramId: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },

  // Helper method to get user from KV
  async getUserFromKV(telegram_id: number): Promise<KVUser | null> {
    try {
      const result = await kv.get<KVUser>(["users", telegram_id.toString()]);
      return result.value;
    } catch (e) {
      logger.error(
        `Error getting user from KV: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return null;
    }
  },

  // Update user language - update both KV and Supabase
  async updateUserLanguage(telegram_id: number, language: SupportedLanguage) {
    try {
      // Get current user from KV
      const kvUser = await this.getUserFromKV(telegram_id);

      if (!kvUser) {
        return [null, new Error("User not found in KV")] as const;
      }

      // Update Supabase in the background (don't wait)
      await supabase
        .from("users")
        .update({ language })
        .eq("telegram_id", telegram_id);

      // Update KV
      const updatedUser: KVUser = {
        ...kvUser,
        language,
        updated_at: new Date().toISOString(),
      };

      await kv.set(["users", telegram_id.toString()], updatedUser);
      logger.info(`User ${telegram_id} language updated to ${language} in KV`);

      return [updatedUser, null] as const;
    } catch (e) {
      logger.error(
        `Exception in updateUserLanguage: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },

  // Get counts for admin statistics - use KV for stats, fallback to Supabase
  async getAdminStats() {
    try {
      // Count users in KV
      let totalUsers = 0;
      const userEntries = kv.list({ prefix: ["users"] });
      for await (const entry of userEntries) {
        // Only count entries that directly represent users (not their words)
        if (entry.key.length === 2) {
          totalUsers++;
        }
      }

      // Since we don't track last_activity, we'll use total users as active users
      const activeUsers = totalUsers;

      // If no users in KV, fallback to Supabase
      if (totalUsers === 0) {
        const { count, error: countError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (!countError && count !== null) {
          totalUsers = count;
          // Since we don't track last_activity, we'll use total users as active users
          return [{ totalUsers, activeUsers: count }, null] as const;
        }
      }

      return [
        {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
        },
        null,
      ] as const;
    } catch (e) {
      logger.error(
        `Exception in getAdminStats: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },
};
