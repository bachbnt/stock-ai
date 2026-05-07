import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, BarChart2 } from 'lucide-react';
import { useTransactions, useAuth } from '@/hooks/usePortfolio';
import { useStockQuotes } from '@/hooks/useStock';
import { useT } from '@/contexts/I18nContext';
import {
  computeHoldings,
  computeRealizedPnl,
  enrichHoldings,
  computeSummary,
  fmtMoney,
} from '@/lib/portfolio';
import { pnlColor, COLOR_TEXT, COLOR_NONE, COLOR_BORDER, COLOR_BG_CARD, COLOR_BG_HOVER, COLOR_ACCENT } from '@/lib/colors';
import { HoldingsTable } from './HoldingsTable';
import { PortfolioChart } from './PortfolioChart';
import { TransactionList } from './TransactionList';
import { TransactionModal } from './TransactionModal';
import { StockDetail } from '@/components/StockDetail';

function SummaryCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 border flex items-start gap-3"
      style={{ backgroundColor: COLOR_BG_CARD, borderColor: COLOR_BORDER }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: COLOR_BG_HOVER }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-base font-bold text-white mt-0.5 truncate" style={{ color: color ?? COLOR_TEXT }}>
          {value}
        </p>
        {sub && <p className="text-xs mt-0.5 font-semibold" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

type PortfolioTab = 'holdings' | 'transactions';

export function Portfolio() {
  const { t, locale } = useT();
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useTransactions(user?.id ?? null);
  const [showAdd, setShowAdd] = useState(false);
  const [tab, setTab] = useState<PortfolioTab>('holdings');
  const [detailSymbol, setDetailSymbol] = useState<string | null>(null);

  const holdings = computeHoldings(transactions);
  const holdingSymbols = holdings.map((h) => h.symbol);
  const { data: quotes = {} } = useStockQuotes(holdingSymbols);
  const enriched = enrichHoldings(holdings, quotes);
  const realizedPnl = computeRealizedPnl(transactions);
  const summary = computeSummary(enriched, realizedPnl);

  const unrealizedColor = pnlColor(summary.unrealizedPnl);
  const realizedColor = pnlColor(realizedPnl);

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t('portfolio_title')}</h1>
          <p className="text-sm text-text-secondary mt-0.5">{user?.email}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: COLOR_ACCENT }}
        >
          <Plus size={15} /> {t('portfolio_add_tx')}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard
          label={t('portfolio_total_cost')}
          value={fmtMoney(summary.totalCost, locale)}
          icon={<Wallet size={16} color={COLOR_NONE} />}
        />
        <SummaryCard
          label={t('portfolio_total_value')}
          value={fmtMoney(summary.totalValue, locale)}
          icon={<BarChart2 size={16} color={COLOR_ACCENT} />}
        />
        <SummaryCard
          label={t('portfolio_unrealized_pnl')}
          value={`${summary.unrealizedPnl > 0 ? '+' : ''}${fmtMoney(summary.unrealizedPnl, locale)}`}
          sub={`${summary.unrealizedPct > 0 ? '+' : ''}${summary.unrealizedPct.toFixed(2)}%`}
          color={unrealizedColor}
          icon={
            summary.unrealizedPnl >= 0
              ? <TrendingUp size={16} color={unrealizedColor} />
              : <TrendingDown size={16} color={unrealizedColor} />
          }
        />
        <SummaryCard
          label={t('portfolio_realized_pnl')}
          value={`${realizedPnl > 0 ? '+' : ''}${fmtMoney(realizedPnl, locale)}`}
          color={realizedColor}
          icon={
            realizedPnl >= 0
              ? <TrendingUp size={16} color={realizedColor} />
              : <TrendingDown size={16} color={realizedColor} />
          }
        />
      </div>

      {holdings.length > 0 && (
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: COLOR_BG_CARD, borderColor: COLOR_BORDER }}
        >
          <PortfolioChart holdings={holdings} />
        </div>
      )}

      <div className="flex gap-0 border-b" style={{ borderColor: COLOR_BORDER }}>
        {([
          { id: 'holdings' as const, label: t('portfolio_tab_holdings', { n: String(holdings.length) }) },
          { id: 'transactions' as const, label: t('portfolio_tab_transactions', { n: String(transactions.length) }) },
        ] as const).map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: tab === tb.id ? COLOR_TEXT : COLOR_NONE,
              borderBottom: tab === tb.id ? `2px solid ${COLOR_ACCENT}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'holdings' && (
        <HoldingsTable holdings={enriched} onSelectSymbol={setDetailSymbol} />
      )}
      {tab === 'transactions' && (
        <TransactionList transactions={transactions} />
      )}

      {showAdd && (
        <TransactionModal transactions={transactions} onClose={() => setShowAdd(false)} />
      )}

      {detailSymbol && (
        <StockDetail
          symbol={detailSymbol}
          name={detailSymbol}
          onClose={() => setDetailSymbol(null)}
        />
      )}
    </div>
  );
}
