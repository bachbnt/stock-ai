import { useState, useMemo } from 'react';
import { RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, TrendingUp, TrendingDown, Pin } from 'lucide-react';
import { useStockList, useStockQuotes } from '../hooks/useStock';
import { useT } from '../contexts/I18nContext';
import type { StockItem, QuoteData } from '../lib/api';
import { StockDetail } from './StockDetail';

const PAGE_SIZE = 10;
const PINNED = ['FPT'];

function fmt(n?: number): string {
  if (n == null || n === 0) return '—';
  return (n / 1000).toFixed(3);
}

function fmtVol(n?: number): string {
  if (n == null || n === 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function priceColor(pct?: number): string {
  if (pct == null || pct === 0) return '#f0b90b';
  return pct > 0 ? '#16c784' : '#ea3943';
}

function PriceCell({ value, pct }: { value?: number; pct?: number }) {
  if (value == null || value === 0) return <span className="text-[#858ca2]">—</span>;
  return <span className="font-semibold text-sm" style={{ color: priceColor(pct) }}>{fmt(value)}</span>;
}

type ChangeMode = 'pct' | 'price';

function ChangeCell({ pct, close, mode }: { pct?: number; close?: number; mode: ChangeMode }) {
  const hasPrice = close != null && close > 0;
  if (!hasPrice) return <span style={{ color: '#858ca2' }}>—</span>;
  if (pct == null) return <span style={{ color: '#f0b90b' }}>—</span>;
  const isUp = pct > 0;
  const isFlat = pct === 0;
  const color = isFlat ? '#f0b90b' : isUp ? '#16c784' : '#ea3943';

  let display: string;
  if (mode === 'price' && close) {
    const priceChange = Math.round(close * pct / 100);
    display = `${isUp ? '+' : ''}${priceChange.toLocaleString('vi-VN')}`;
  } else {
    display = `${isUp ? '+' : ''}${pct.toFixed(2)}%`;
  }

  return (
    <div className="flex items-center justify-end gap-1" style={{ color }}>
      {!isFlat && (isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
      <span className="font-semibold text-sm">{display}</span>
    </div>
  );
}

function SkeletonCell() {
  return (
    <td className="px-4 py-3 text-right">
      <div className="skeleton h-3.5 rounded ml-auto" style={{ width: 60 }} />
    </td>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b" style={{ borderColor: '#2a2b2e' }}>
      <td className="px-4 py-3"><div className="skeleton h-3.5 rounded" style={{ width: 28 }} /></td>
      <td className="px-4 py-3"><div className="skeleton h-3.5 rounded" style={{ width: 48 }} /></td>
      <td className="px-4 py-3"><div className="skeleton h-3.5 rounded" style={{ width: 220 }} /></td>
      <SkeletonCell />
      <SkeletonCell />
      <SkeletonCell />
    </tr>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const { t } = useT();
  const btnStyle = { backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' };
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="flex items-center p-1.5 rounded-lg disabled:opacity-30"
        style={btnStyle}
        title={t('stock_list_first')}
      >
        <ChevronsLeft size={14} />
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
        style={btnStyle}
      >
        <ChevronLeft size={14} /> {t('stock_list_prev')}
      </button>
      <span className="text-sm font-medium px-1" style={{ color: '#858ca2' }}>
        {t('stock_list_page', { page: String(page), total: String(totalPages) })}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
        style={btnStyle}
      >
        {t('stock_list_next')} <ChevronRight size={14} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page >= totalPages}
        className="flex items-center p-1.5 rounded-lg disabled:opacity-30"
        style={btnStyle}
        title={t('stock_list_last')}
      >
        <ChevronsRight size={14} />
      </button>
    </div>
  );
}

function QuoteRow({
  stock,
  idx,
  page,
  pinned = false,
  quote,
  quoteLoading,
  changeMode,
  onSelect,
}: {
  stock: StockItem;
  idx: number;
  page: number;
  pinned?: boolean;
  quote?: QuoteData;
  quoteLoading: boolean;
  changeMode: ChangeMode;
  onSelect: (s: StockItem) => void;
}) {
  return (
    <tr
      key={stock.symbol}
      onClick={() => onSelect(stock)}
      className="border-b cursor-pointer"
      style={{ borderColor: '#2a2b2e' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#22232a')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <td className="px-4 py-3 text-[#858ca2] text-sm">
        {pinned
          ? <Pin size={12} style={{ color: '#3861fb' }} />
          : (page - 1) * PAGE_SIZE + idx + 1}
      </td>
      <td className="px-4 py-3">
        <span className="font-bold text-white text-sm">{stock.symbol}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-[#c8ccd8] truncate block max-w-xs">
          {stock.organ_name ?? '—'}
        </span>
      </td>

      {quoteLoading && !quote ? (
        <>
          <SkeletonCell />
          <SkeletonCell />
          <SkeletonCell />
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-right"><PriceCell value={quote?.close} pct={quote?.change_pct} /></td>
          <td className="px-4 py-3 text-right">
            <ChangeCell pct={quote?.change_pct} close={quote?.close} mode={changeMode} />
          </td>
          <td className="px-4 py-3 text-right text-sm text-[#858ca2]">
            {fmtVol(quote?.volume)}
          </td>
        </>
      )}
    </tr>
  );
}

export function StockTable() {
  const { t } = useT();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');
  const [changeMode, setChangeMode] = useState<ChangeMode>('pct');

  const { data: stocks, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useStockList();

  const pinnedStocks = useMemo(() => {
    if (!stocks || search.trim()) return [];
    return stocks.filter((s) => PINNED.includes(s.symbol));
  }, [stocks, search]);

  const filtered = useMemo(() => {
    if (!stocks) return [];
    const q = search.trim().toLowerCase();
    if (q) {
      return stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          (s.organ_name ?? '').toLowerCase().includes(q),
      );
    }
    return stocks.filter((s) => !PINNED.includes(s.symbol));
  }, [stocks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStocks = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const visibleSymbols = useMemo(
    () => [...pinnedStocks.map((s) => s.symbol), ...pageStocks.map((s) => s.symbol)],
    [pinnedStocks, pageStocks],
  );
  const { data: quotes, isLoading: quotesLoading } = useStockQuotes(visibleSymbols);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handleSelect(stock: StockItem) {
    setSelectedSymbol(stock.symbol);
    setSelectedName(stock.organ_name ?? stock.symbol);
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{t('stock_list_title')}</h1>
          <p className="text-sm text-[#858ca2] mt-0.5">
            {stocks
              ? t('stock_list_count', { n: (filtered.length + pinnedStocks.length).toLocaleString() })
              : t('stock_list_loading')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[#5a6172] hidden sm:inline">
              {t('stock_list_updated', { time: lastUpdated })}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' }}
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            {t('stock_list_refresh')}
          </button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: '#858ca2' }}
        />
        <input
          type="text"
          placeholder={t('stock_list_search')}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#1a1b1e', border: '1px solid #2a2b2e', color: '#ffffff' }}
        />
      </div>

      {isError && (
        <div
          className="rounded-xl p-4 mb-4 border text-sm"
          style={{ backgroundColor: '#ea394315', borderColor: '#ea394340', color: '#ea3943' }}
        >
          {t('stock_list_error')}
        </div>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: '#2a2b2e', backgroundColor: '#1a1b1e' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                className="border-b text-xs font-medium uppercase tracking-wider"
                style={{ borderColor: '#2a2b2e', color: '#858ca2' }}
              >
                <th className="px-4 py-3 w-10">{t('stock_list_col_no')}</th>
                <th className="px-4 py-3 w-24">{t('stock_list_col_symbol')}</th>
                <th className="px-4 py-3">{t('stock_list_col_company')}</th>
                <th className="px-4 py-3 text-right">{t('stock_list_col_price')}</th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => setChangeMode((m) => m === 'pct' ? 'price' : 'pct')}
                    className="flex items-center gap-1 ml-auto hover:opacity-80 transition-opacity"
                    title={t('stock_list_col_change')}
                  >
                    {t('stock_list_col_change')}
                    <span
                      className="text-xs px-1 py-0.5 rounded font-bold"
                      style={{ backgroundColor: '#22232a', color: '#3861fb' }}
                    >
                      {changeMode === 'pct' ? '%' : '₫'}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right">{t('stock_list_col_volume')}</th>
              </tr>
            </thead>
            <tbody>
              {pinnedStocks.map((stock) => (
                <QuoteRow
                  key={stock.symbol}
                  stock={stock}
                  idx={0}
                  page={1}
                  pinned
                  quote={quotes?.[stock.symbol]}
                  quoteLoading={quotesLoading}
                  changeMode={changeMode}
                  onSelect={handleSelect}
                />
              ))}
              {isLoading
                ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                : pageStocks.map((stock, idx) => (
                    <QuoteRow
                      key={stock.symbol}
                      stock={stock}
                      idx={idx}
                      page={page}
                      quote={quotes?.[stock.symbol]}
                      quoteLoading={quotesLoading}
                      changeMode={changeMode}
                      onSelect={handleSelect}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && filtered.length > PAGE_SIZE && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <p className="text-xs text-[#5a6172] mt-3 text-center">
        {t('stock_list_footer')}
      </p>

      {selectedSymbol && (
        <StockDetail
          symbol={selectedSymbol}
          name={selectedName}
          onClose={() => setSelectedSymbol(null)}
        />
      )}
    </div>
  );
}
