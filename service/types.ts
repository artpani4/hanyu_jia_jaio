// service/types.ts
export interface IUser {
  id: string; // uuid
  telegram_id: number;
  username: string | null;
  language: string;
  created_at?: string;
  updated_at?: string;
}

export type WordData = {
  word: string;
  pinyin: string;
  hanzi: string;
  translation: string;
};

export type AIResponse = {
  success: boolean;
  sentences?: string[];
  error?: string;
};
