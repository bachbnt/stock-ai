import { useState, useMemo } from 'react';
import { RefreshCw, Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useStockList, useStockQuotes } from '../hooks/useStock';
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

function PriceCell({ value }: { value?: number }) {
  if (value == null || value === 0) return <span className="text-[#858ca2]">—</span>;
  return <span className="font-semibold text-white text-sm">{fmt(value)}</span>;
}

function ChangeCell({ pct }: { pct?: number }) {
  if (pct == null) return <span className="text-[#858ca2]">—</span>;
  const isUp = pct > 0;
  const isFlat = pct === 0;
  const color = isFlat ? '#858ca2' : isUp ? '#16c784' : '#ea3943';
  return (
    <div className="flex items-center justify-end gap-1" style={{ color }}>
      {!isFlat && (isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
      <span className="font-semibold text-sm">
        {isUp ? '+' : ''}{pct.toFixed(2)}%
      </span>
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
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
        style={{ backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' }}
      >
        <ChevronLeft size={14} /> Trước
      </button>
      <span className="text-sm font-medium" style={{ color: '#858ca2' }}>
        Trang {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30"
        style={{ backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' }}
      >
        Tiếp <ChevronRight size={14} />
      </button>
    </div>
  );
}

function QuoteRow({
  stock,
  idx,
  page,
  quote,
  quoteLoading,
  onSelect,
}: {
  stock: StockItem;
  idx: number;
  page: number;
  quote?: QuoteData;
  quoteLoading: boolean;
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
        {(page - 1) * PAGE_SIZE + idx + 1}
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
          <SkeletonCell />
          <SkeletonCell />
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-right"><PriceCell value={quote?.close} /></td>
          <td className="px-4 py-3 text-right">
            <span className="text-sm" style={{ color: '#16c784' }}>
              {quote?.high ? fmt(quote.high) : '—'}
            </span>
          </td>
          <td className="px-4 py-3 text-right">
            <span className="text-sm" style={{ color: '#ea3943' }}>
              {quote?.low ? fmt(quote.low) : '—'}
            </span>
          </td>
          <td className="px-4 py-3 text-right">
            <ChangeCell pct={quote?.change_pct} />
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');

  const { data: stocks, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useStockList();

  const filtered = useMemo(() => {
    if (!stocks) return [];
    const q = search.trim().toLowerCase();
    const list = q
      ? stocks.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            (s.organ_name ?? '').toLowerCase().includes(q),
        )
      : stocks;
    // Đưa PINNED lên đầu khi không search
    if (q) return list;
    const pinned = list.filter((s) => PINNED.includes(s.symbol));
    const rest = list.filter((s) => !PINNED.includes(s.symbol));
    return [...pinned, ...rest];
  }, [stocks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStocks = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageSymbols = useMemo(() => pageStocks.map((s) => s.symbol), [pageStocks]);

  const { data: quotes, isLoading: quotesLoading } = useStockQuotes(pageSymbols);

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
          <h1 className="text-xl font-bold text-white">Danh sách Chứng khoán</h1>
          <p className="text-sm text-[#858ca2] mt-0.5">
            {stocks ? `${filtered.length.toLocaleString()} mã` : 'Đang tải...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[#5a6172] hidden sm:inline">
              Cập nhật lúc {lastUpdated}
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#1a1b1e', color: '#858ca2', border: '1px solid #2a2b2e' }}
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: '#858ca2' }}
        />
        <input
          type="text"
          placeholder="Tìm theo mã hoặc tên công ty..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#1a1b1e', border: '1px solid #2a2b2e', color: '#ffffff' }}
        />
      </div>

      {/* Error */}
      {isError && (
        <div
          className="rounded-xl p-4 mb-4 border text-sm"
          style={{ backgroundColor: '#ea394315', borderColor: '#ea394340', color: '#ea3943' }}
        >
          Không thể tải dữ liệu. Kiểm tra kết nối tới backend (localhost:8000).
        </div>
      )}

      {/* Table */}
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
                <th className="px-4 py-3 w-10">#</th>
                <th className="px-4 py-3 w-24">Mã</th>
                <th className="px-4 py-3">Tên công ty</th>
                <th className="px-4 py-3 text-right">Giá khớp</th>
                <th className="px-4 py-3 text-right">Cao</th>
                <th className="px-4 py-3 text-right">Thấp</th>
                <th className="px-4 py-3 text-right">Biến động</th>
                <th className="px-4 py-3 text-right">KL giao dịch</th>
              </tr>
            </thead>
            <tbody>
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
        Giá tự động làm mới sau 2 phút · Click vào mã để xem biểu đồ
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
