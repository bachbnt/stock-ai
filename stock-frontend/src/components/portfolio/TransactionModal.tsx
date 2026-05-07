import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useAddTransaction, useUpdateTransaction } from '@/hooks/usePortfolio';
import { useT } from '@/contexts/I18nContext';
import { maxSellQty } from '@/lib/portfolio';
import { useStockList, useStockQuotes } from '@/hooks/useStock';
import type { Transaction } from '@/lib/supabase';
import {
  txTypeColor,
  COLOR_TEXT,
  COLOR_DOWN,
  COLOR_NONE,
  COLOR_ACCENT,
  COLOR_BG_PRIMARY,
  COLOR_BG_CARD,
  COLOR_BORDER,
} from '@/lib/colors';

interface Props {
  editing?: Transaction | null;
  transactions: Transaction[];
  onClose: () => void;
}

export function TransactionModal({ editing, transactions, onClose }: Props) {
  const { t } = useT();
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

  // Derive displayed price: use market price until user manually edits the field
  const displayPrice = !priceEdited && marketPrice > 0 ? String(marketPrice) : price;

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
    ? maxSellQty(editing ? transactions.filter((tx) => tx.id !== editing.id) : transactions, symbol)
    : null;

  // Clamp quantity to maxQty without an effect
  const effectiveQty = maxQty !== null ? Math.min(Number(quantity), maxQty) : Number(quantity);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = effectiveQty;
    const prc = Number(displayPrice);
    const f = Number(fee) || 0;

    if (!symbol) return setError(t('tx_modal_err_symbol'));
    if (qty <= 0) return setError(t('tx_modal_err_qty'));
    if (prc <= 0) return setError(t('tx_modal_err_price'));
    if (type === 'sell' && maxQty !== null && qty > maxQty) {
      return setError(t('tx_modal_err_max_qty', { max: maxQty.toLocaleString() }));
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
      setError(err instanceof Error ? err.message : t('tx_modal_err_generic'));
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
        style={{ backgroundColor: COLOR_BG_CARD, borderColor: COLOR_BORDER }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: COLOR_BORDER }}>
          <h2 className="text-base font-bold text-white">
            {editing ? t('tx_modal_title_edit') : t('tx_modal_title_add')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-xs rounded-lg p-3" style={{ backgroundColor: COLOR_DOWN + '15', color: COLOR_DOWN }}>
              {error}
            </div>
          )}

          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: COLOR_BORDER }}>
            {(['buy', 'sell'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setType(tp)}
                className="flex-1 py-2 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: type === tp ? txTypeColor(tp) : COLOR_BG_PRIMARY,
                  color: type === tp ? COLOR_TEXT : COLOR_NONE,
                }}
              >
                {tp === 'buy' ? t('tx_type_buy') : t('tx_type_sell')}
              </button>
            ))}
          </div>

          <div className="relative">
            <label className="text-xs text-text-secondary mb-1 block">{t('tx_modal_symbol_label')}</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder={t('tx_modal_symbol_placeholder')}
                value={symbolSearch}
                onChange={(e) => { setSymbolSearch(e.target.value); setSymbol(''); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: COLOR_BG_PRIMARY, border: `1px solid ${COLOR_BORDER}` }}
              />
            </div>
            {symbol && (
              <span className="absolute right-3 top-7 text-xs font-bold" style={{ color: COLOR_ACCENT }}>
                {symbol}
              </span>
            )}
            {showDropdown && symbolSearch && filteredStocks.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1 rounded-lg border overflow-hidden shadow-xl"
                style={{ backgroundColor: COLOR_BG_CARD, borderColor: COLOR_BORDER }}
              >
                {filteredStocks.map((s) => (
                  <button
                    key={s.symbol}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-bg-hover flex items-center gap-2"
                    onClick={() => {
                      setSymbol(s.symbol);
                      setSymbolSearch(s.symbol);
                      setShowDropdown(false);
                      setPriceEdited(false);
                    }}
                  >
                    <span className="font-bold text-white w-14 shrink-0">{s.symbol}</span>
                    <span className="text-text-secondary truncate text-xs">{s.organ_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">
                {t('tx_modal_qty_label')}
                {maxQty !== null && ` ${t('tx_modal_qty_max', { max: maxQty.toLocaleString() })}`}
              </label>
              <input
                type="number"
                required
                step="1"
                min={1}
                max={maxQty ?? undefined}
                value={String(effectiveQty)}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: COLOR_BG_PRIMARY, border: `1px solid ${COLOR_BORDER}` }}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">
                {t('tx_modal_price_label')}
                {marketPrice > 0 && !priceEdited && ` ${t('tx_modal_price_market')}`}
              </label>
              <input
                type="number"
                required
                step="1"
                min={1}
                value={displayPrice}
                onChange={(e) => { setPrice(e.target.value); setPriceEdited(true); }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: COLOR_BG_PRIMARY, border: `1px solid ${COLOR_BORDER}` }}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">{t('tx_modal_fee_label')}</label>
              <input
                type="number"
                min={0}
                step="1"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: COLOR_BG_PRIMARY, border: `1px solid ${COLOR_BORDER}` }}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">{t('tx_modal_date_label')}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white"
                style={{ backgroundColor: COLOR_BG_PRIMARY, border: `1px solid ${COLOR_BORDER}`, colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1 block">{t('tx_modal_note_label')}</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none text-white resize-none"
              style={{ backgroundColor: COLOR_BG_PRIMARY, border: `1px solid ${COLOR_BORDER}` }}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: txTypeColor(type) }}
          >
            {isPending
              ? t('tx_modal_saving')
              : editing
                ? t('tx_modal_btn_update')
                : type === 'buy'
                  ? t('tx_modal_btn_add_buy')
                  : t('tx_modal_btn_add_sell')}
          </button>
        </form>
      </div>
    </div>
  );
}
