import type { Transaction } from './supabase';

export interface Holding {
  symbol: string;
  quantity: number;
  avgCost: number;   // thousands VND per share
  totalCost: number; // thousands VND total
}

export interface HoldingWithPrice extends Holding {
  currentPrice: number;  // thousands VND
  currentValue: number;  // thousands VND total
  unrealizedPnl: number;
  unrealizedPct: number;
}

export interface PortfolioSummary {
  totalCost: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPct: number;
  realizedPnl: number;
}

interface SymbolState {
  qty: number;
  costBasis: number;
}

function replayTransactions(transactions: Transaction[]): {
  states: Map<string, SymbolState>;
  realizedPnl: number;
} {
  const states = new Map<string, SymbolState>();
  let realizedPnl = 0;

  for (const tx of [...transactions].sort((a, b) => a.date.localeCompare(b.date))) {
    const cur = states.get(tx.symbol) ?? { qty: 0, costBasis: 0 };

    if (tx.type === 'buy') {
      states.set(tx.symbol, {
        qty: cur.qty + tx.quantity,
        costBasis: cur.costBasis + tx.quantity * tx.price + (tx.fee ?? 0),
      });
    } else {
      const avgCost = cur.qty > 0 ? cur.costBasis / cur.qty : 0;
      const sellRevenue = tx.quantity * tx.price - (tx.fee ?? 0);
      realizedPnl += sellRevenue - avgCost * tx.quantity;
      const remainQty = Math.max(0, cur.qty - tx.quantity);
      states.set(tx.symbol, {
        qty: remainQty,
        costBasis: avgCost * remainQty,
      });
    }
  }

  return { states, realizedPnl };
}

export function computeHoldings(transactions: Transaction[]): Holding[] {
  const { states } = replayTransactions(transactions);
  return Array.from(states.entries())
    .filter(([, v]) => v.qty > 0.0001)
    .map(([symbol, { qty, costBasis }]) => ({
      symbol,
      quantity: qty,
      avgCost: qty > 0 ? costBasis / qty : 0,
      totalCost: costBasis,
    }));
}

export function computeRealizedPnl(transactions: Transaction[]): number {
  return replayTransactions(transactions).realizedPnl;
}

// Max qty that can be sold for a symbol given existing transactions
export function maxSellQty(transactions: Transaction[], symbol: string): number {
  const { states } = replayTransactions(transactions);
  return states.get(symbol)?.qty ?? 0;
}

export function enrichHoldings(
  holdings: Holding[],
  quotes: Record<string, { close?: number }>,
): HoldingWithPrice[] {
  return holdings.map((h) => {
    // quotes from price_board are raw VND (74200) — keep as raw VND to match costBasis units
    const currentPrice = (quotes[h.symbol]?.close ?? 0);
    const currentValue = h.quantity * currentPrice;
    const unrealizedPnl = currentValue - h.totalCost;
    const unrealizedPct = h.totalCost > 0 ? (unrealizedPnl / h.totalCost) * 100 : 0;
    return { ...h, currentPrice, currentValue, unrealizedPnl, unrealizedPct };
  });
}

export function computeSummary(
  holdings: HoldingWithPrice[],
  realizedPnl: number,
): PortfolioSummary {
  const totalCost = holdings.reduce((s, h) => s + h.totalCost, 0);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const unrealizedPnl = totalValue - totalCost;
  const unrealizedPct = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;
  return { totalCost, totalValue, unrealizedPnl, unrealizedPct, realizedPnl };
}

export function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} triệu`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(0)} nghìn`;
  return n.toLocaleString('vi-VN');
}

export function fmtPrice(n: number): string {
  if (!n) return '—';
  return (n / 1000).toFixed(3);
}
