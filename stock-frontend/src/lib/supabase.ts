import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Transaction {
  id: string;
  user_id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number; // in thousands VND (same scale as history API, e.g. 74.2 = 74,200 VND)
  fee: number;
  date: string; // YYYY-MM-DD
  note: string | null;
  created_at: string;
}

export type TransactionInsert = Omit<Transaction, 'id' | 'user_id' | 'created_at'>;
