import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { stockRequest } from '@/lib/api';
import type { Transaction, TransactionInsert } from '@/lib/supabase';
import type { Holding } from '@/lib/portfolio';
import type { StockHistoryItem } from '@/lib/api';

interface StockHistoryResponse {
  success: boolean;
  symbol: string;
  data: StockHistoryItem[];
}

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useTransactions(userId: string | null) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: TransactionInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('transactions').insert({ ...tx, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...tx }: TransactionInsert & { id: string }) => {
      const { error } = await supabase
        .from('transactions')
        .update(tx)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function usePortfolioHistory(holdings: Holding[]) {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const queries = useQueries({
    queries: holdings.map((h) => ({
      queryKey: ['stockHistory', h.symbol],
      queryFn: async () => {
        const res = await stockRequest<StockHistoryResponse>('/v1/stocks/history', {
          symbol: h.symbol, start, end, interval: '1D', source: 'KBS',
        });
        return { symbol: h.symbol, data: res.data };
      },
      staleTime: 5 * 60 * 1000,
      enabled: holdings.length > 0,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  if (isLoading || holdings.length === 0) return { data: [], isLoading };

  // Build date → symbol → price map
  const byDate = new Map<string, Map<string, number>>();
  for (const q of queries) {
    if (!q.data || !Array.isArray(q.data.data)) continue;
    for (const d of q.data.data) {
      const date = d.time.slice(0, 10);
      if (!byDate.has(date)) byDate.set(date, new Map());
      byDate.get(date)!.set(q.data.symbol, d.close);
    }
  }

  const data = Array.from(byDate.keys())
    .sort()
    .map((date) => {
      const prices = byDate.get(date)!;
      // history prices are in thousands VND (74.2) — multiply by 1000 to get raw VND (74200)
    const value = holdings.reduce((sum, h) => sum + h.quantity * (prices.get(h.symbol) ?? 0) * 1000, 0);
      return { date, value };
    })
    .filter((d) => d.value > 0);

  return { data, isLoading: false };
}
