// service/db/queries/user.ts
import { supabase } from "$shared";
import { IUser } from "$types";
import { SupportedLanguage } from "$constants";

export async function upsertUser(
  telegram_id: number,
  data: { username?: string; language?: SupportedLanguage },
) {
  const { data: user, error } = await supabase
    .from("users")
    .upsert({ telegram_id, ...data }, { onConflict: "telegram_id" })
    .select()
    .single();

  return [user as IUser, error] as const;
}

export async function getUserByTelegramId(telegram_id: number) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegram_id)
    .single();

  return [user as IUser, error] as const;
}

export async function updateUserLanguage(
  telegram_id: number,
  language: SupportedLanguage,
) {
  const { data: user, error } = await supabase
    .from("users")
    .update({ language })
    .eq("telegram_id", telegram_id)
    .select()
    .single();

  return [user as IUser, error] as const;
}
