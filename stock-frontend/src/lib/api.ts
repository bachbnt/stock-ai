const STOCK_API = '/api';
const backendApiKey = (import.meta.env.VITE_BACKEND_API_KEY as string) || 'secret123';

export async function stockRequest<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${STOCK_API}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.append(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    headers: {
      'X-API-Key': backendApiKey,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error(String(body.detail ?? res.statusText));
  }
  return res.json() as Promise<T>;
}

export interface StockItem {
  symbol: string;
  organ_name: string;
}

export interface StockHistoryItem {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CompanyInfo = Record<string, unknown>;

export interface QuoteData {
  time?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change_pct?: number;
}
