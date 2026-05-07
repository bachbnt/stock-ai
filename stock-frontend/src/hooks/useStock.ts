import { useQuery } from '@tanstack/react-query';
import { stockRequest } from '../lib/api';
import type { StockItem, StockHistoryItem, CompanyInfo, QuoteData } from '../lib/api';

interface StockListResponse {
  success: boolean;
  total: number;
  data: StockItem[];
}

interface StockHistoryResponse {
  success: boolean;
  symbol: string;
  total: number;
  data: StockHistoryItem[];
}

interface CompanyInfoResponse {
  success: boolean;
  symbol: string;
  data: CompanyInfo;
}

export function useStockList() {
  return useQuery<StockItem[]>({
    queryKey: ['stockList'],
    queryFn: async () => {
      const res = await stockRequest<StockListResponse>('/v1/stocks/list', { source: 'KBS' });
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useStockHistory(symbol: string | null) {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return useQuery<StockHistoryItem[]>({
    queryKey: ['stockHistory', symbol],
    queryFn: async () => {
      const res = await stockRequest<StockHistoryResponse>('/v1/stocks/history', {
        symbol: symbol!,
        start,
        end,
        interval: '1D',
        source: 'KBS',
      });
      return res.data;
    },
    enabled: !!symbol,
  });
}

function normalizeQuote(q: QuoteData): QuoteData {
  if (q.close && q.close > 0) return q;
  const pct = q.change_pct ?? 0;
  const inferredClose = pct < 0 ? q.low : pct > 0 ? q.high : (q.high ?? q.low);
  return { ...q, close: inferredClose ?? 0 };
}

export function useStockQuotes(symbols: string[]) {
  return useQuery<Record<string, QuoteData>>({
    queryKey: ['stockQuotes', symbols.join(',')],
    queryFn: async () => {
      if (symbols.length === 0) return {};
      const res = await stockRequest<{ success: boolean; data: Record<string, QuoteData> }>(
        '/v1/stocks/quotes',
        { symbols: symbols.join(','), source: 'KBS' },
      );
      return Object.fromEntries(
        Object.entries(res.data).map(([sym, q]) => [sym, normalizeQuote(q)])
      );
    },
    enabled: symbols.length > 0,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useCompanyInfo(symbol: string | null) {
  return useQuery<CompanyInfo>({
    queryKey: ['companyInfo', symbol],
    queryFn: async () => {
      const res = await stockRequest<CompanyInfoResponse>(`/v1/stocks/company/${symbol}`, {
        source: 'KBS',
      });
      return res.data;
    },
    enabled: !!symbol,
  });
}
