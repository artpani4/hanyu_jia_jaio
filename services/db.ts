// services/db.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { ENV } from "../config/mod.ts";
import { SupportedLanguage, User } from "../types.ts";
import { logger } from "../utils/logger.ts";

// Initialize Supabase client
const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
  db: {
    schema: ENV.SUPABASE_SCHEMA,
  },
});

// User-related database operations
export const userDb = {
  // Create or update a user
  async upsertUser(
    telegram_id: number,
    data: { username?: string; language?: SupportedLanguage },
  ) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .upsert({
          telegram_id,
          ...data,
        }, { onConflict: "telegram_id" })
        .select()
        .single();

      if (error) {
        logger.error(`Error upserting user: ${error.message}`);
        return [null, error] as const;
      }

      return [user as User, null] as const;
    } catch (e) {
      logger.error(
        `Exception in upsertUser: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },

  // Get a user by Telegram ID
  async getUserByTelegramId(telegram_id: number) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", telegram_id)
        .single();

      if (error) {
        logger.error(`Error getting user: ${error.message}`);
        return [null, error] as const;
      }

      return [user as User, null] as const;
    } catch (e) {
      logger.error(
        `Exception in getUserByTelegramId: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },

  // Update user language
  async updateUserLanguage(telegram_id: number, language: SupportedLanguage) {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .update({ language })
        .eq("telegram_id", telegram_id)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating user language: ${error.message}`);
        return [null, error] as const;
      }

      return [user as User, null] as const;
    } catch (e) {
      logger.error(
        `Exception in updateUserLanguage: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      return [null, e instanceof Error ? e : new Error(String(e))] as const;
    }
  },

  // Get counts for admin statistics
  async getAdminStats() {
    try {
      // Get total users count
      const { count: totalUsers, error: countError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (countError) {
        logger.error(`Error getting user count: ${countError.message}`);
        return [null, countError] as const;
      }

      // Since we don't track last_activity, we'll use total users as active users
      const activeUsers = totalUsers;

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
