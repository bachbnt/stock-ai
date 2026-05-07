import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useAddTransaction, useUpdateTransaction } from '../../hooks/usePortfolio';
import { maxSellQty } from '../../lib/portfolio';
import { useStockList, useStockQuotes } from '../../hooks/useStock';
import type { Transaction } from '../../lib/supabase';

interface Props {
  editing?: Transaction | null;
  transactions: Transaction[];
  onClose: () => void;
}

export function TransactionModal({ editing, transactions, onClose }: Props) {
  const { data: stocks } = useStockList();
  const addTx = useAddTransaction();
  const updateTx = useUpdateTransaction();

  const [type, setType] = useState<'buy' | 'sell'>(editing?.type ?? 'buy');
  const [symbol, setSymbol] = useState(editing?.symbol ?? '');
  const [symbolSearch, setSymbolSearch] = useState(editing?.symbol ?? '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [quantity, setQuantity] = useState(String(editing?.quantity ?? 100));
  const [price, setPrice] = useState(String(editing?.price ?? ''));
  const [priceEdited, setPriceEdited] = useState(!!editing);
  const [fee, setFee] = useState(String(editing?.fee ?? '0'));
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(editing?.note ?? '');
  const [error, setError] = useState<string | null>(null);

  const { data: marketQuotes } = useStockQuotes(symbol ? [symbol] : []);
  const marketPrice = symbol && marketQuotes ? (marketQuotes[symbol]?.close ?? 0) : 0;

  // Auto-fill price with current market price when symbol is selected
  useEffect(() => {
    if (marketPrice > 0 && !priceEdited) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrice(String(marketPrice));
    }
  }, [marketPrice, priceEdited]);

  const filteredStocks = stocks
    ? stocks
        .filter(
          (s) =>
            s.symbol.toLowerCase().includes(symbolSearch.toLowerCase()) ||
            s.organ_name.toLowerCase().includes(symbolSearch.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  const maxQty = type === 'sell' && symbol
    ? maxSellQty(editing ? transactions.filter((t) => t.id !== editing.id) : transactions, symbol)
    : null;

  useEffect(() => {
    if (type === 'sell' && maxQty !== null && Number(quantity) > maxQty) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantity(String(maxQty));
    }
  }, [type, maxQty]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);
    const prc = Number(price);
    const f = Number(fee) || 0;

    if (!symbol) return setError('Chọn mã cổ phiếu');
    if (qty <= 0) return setError('Số lượng phải > 0');
    if (prc <= 0) return setError('Giá phải > 0');
    if (type === 'sell' && maxQty !== null && qty > maxQty) {
      return setError(`Chỉ có thể bán tối đa ${maxQty.toLocaleString()} CP`);
    }

    try {
      const payload = { symbol, type, quantity: qty, price: prc, fee: f, date, note: note || null };
      if (editing) {
        await updateTx.mutateAsync({ id: editing.id, ...payload });
      } else {
        await addTx.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    }
  }

  const isPending = addTx.isPending || updateTx.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: '#1a1b1e', borderColor: '#2a2b2e' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#2a2b2e' }}>
          <h2 className="text-base font-bold text-white">
            {editing ? 'Sửa giao dịch' : 'Thêm giao dịch'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#22232a] text-[#858ca2] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-xs rounded-lg p-3" style={{ backgroundColor: '#ea394315', color: '#ea3943' }}>
              {error}
            </div>
          )}

          {/* Buy / Sell toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#2a2b2e' }}>
            {(['buy', 'sell'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="flex-1 py-2 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: type === t ? (t === 'buy' ? '#16c784' : '#ea3943') : '#0d0e11',
                  color: type === t ? '#fff' : '#858ca2',
                }}
              >
                {t === 'buy' ? 'Mua' : 'Bán'}
              </button>
            ))}
          </div>

          {/* Symbol search */}
          <div className="relative">
            <label className="text-xs text-[#858ca2] mb-1 block">Mã cổ phiếu</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858ca2]" />
              <input
                type="text"
                placeholder="Tìm mã..."
                value={symbolSearch}
                onChange={(e) => { setSymbolSearch(e.target.value); setSymbol(''); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: '#0d0e11', border: '1px solid #2a2b2e' }}
              />
            </div>
            {symbol && (
              <span className="absolute right-3 top-7 text-xs font-bold" style={{ color: '#3861fb' }}>
                {symbol}
              </span>
            )}
            {showDropdown && symbolSearch && filteredStocks.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1 rounded-lg border overflow-hidden shadow-xl"
                style={{ backgroundColor: '#1a1b1e', borderColor: '#2a2b2e' }}
              >
                {filteredStocks.map((s) => (
                  <button
                    key={s.symbol}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#22232a] flex items-center gap-2"
                    onClick={() => {
                      setSymbol(s.symbol);
                      setSymbolSearch(s.symbol);
                      setShowDropdown(false);
                      setPriceEdited(false); // allow auto-fill on new symbol
                    }}
                  >
                    <span className="font-bold text-white w-14 shrink-0">{s.symbol}</span>
                    <span className="text-[#858ca2] truncate text-xs">{s.organ_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#858ca2] mb-1 block">
                Số lượng{maxQty !== null ? ` (tối đa ${maxQty.toLocaleString()})` : ''}
              </label>
              <input
                type="number"
                required
                step="1"
                min={1}
                max={maxQty ?? undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: '#0d0e11', border: '1px solid #2a2b2e' }}
              />
            </div>
            <div>
              <label className="text-xs text-[#858ca2] mb-1 block">
                Giá (VND){marketPrice > 0 && !priceEdited ? ` · thị trường` : ''}
              </label>
              <input
                type="number"
                required
                step="1"
                min={1}
                value={price}
                placeholder={marketPrice > 0 ? String(marketPrice) : '10000'}
                onChange={(e) => { setPrice(e.target.value); setPriceEdited(true); }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: '#0d0e11', border: '1px solid #2a2b2e' }}
              />
            </div>
            <div>
              <label className="text-xs text-[#858ca2] mb-1 block">Phí (VND)</label>
              <input
                type="number"
                min={0}
                step="1"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: '#0d0e11', border: '1px solid #2a2b2e' }}
              />
            </div>
            <div>
              <label className="text-xs text-[#858ca2] mb-1 block">Ngày</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: '#0d0e11', border: '1px solid #2a2b2e', colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#858ca2] mb-1 block">Ghi chú (tuỳ chọn)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
              style={{ backgroundColor: '#0d0e11', border: '1px solid #2a2b2e' }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: type === 'buy' ? '#16c784' : '#ea3943' }}
          >
            {isPending ? 'Đang lưu...' : editing ? 'Cập nhật' : type === 'buy' ? 'Thêm lệnh mua' : 'Thêm lệnh bán'}
          </button>
        </form>
      </div>
    </div>
  );
}
