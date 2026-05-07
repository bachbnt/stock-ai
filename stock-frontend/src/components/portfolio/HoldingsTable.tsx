import { useT } from '../../contexts/I18nContext';
import { fmtMoney, fmtPrice } from '../../lib/portfolio';
import type { HoldingWithPrice } from '../../lib/portfolio';

function pnlColor(v: number) {
  if (v > 0) return '#16c784';
  if (v < 0) return '#ea3943';
  return '#858ca2';
}

function fmtPnl(n: number, locale: Parameters<typeof fmtMoney>[1]) {
  return `${n > 0 ? '+' : ''}${fmtMoney(n, locale)}`;
}

interface Props {
  holdings: HoldingWithPrice[];
  onSelectSymbol: (symbol: string) => void;
}

export function HoldingsTable({ holdings, onSelectSymbol }: Props) {
  const { t, locale } = useT();

  if (holdings.length === 0) {
    return (
      <p className="text-sm text-[#858ca2] text-center py-8">
        {t('holdings_empty')}
      </p>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#2a2b2e', backgroundColor: '#1a1b1e' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-xs font-medium uppercase tracking-wider" style={{ borderColor: '#2a2b2e', color: '#858ca2' }}>
              <th className="px-4 py-3">{t('holdings_col_symbol')}</th>
              <th className="px-4 py-3 text-right">{t('holdings_col_qty')}</th>
              <th className="px-4 py-3 text-right">{t('holdings_col_avg_cost')}</th>
              <th className="px-4 py-3 text-right">{t('holdings_col_current_price')}</th>
              <th className="px-4 py-3 text-right">{t('holdings_col_value')}</th>
              <th className="px-4 py-3 text-right">{t('holdings_col_pnl')}</th>
              <th className="px-4 py-3 text-right">{t('holdings_col_pct')}</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr
                key={h.symbol}
                onClick={() => onSelectSymbol(h.symbol)}
                className="border-b cursor-pointer"
                style={{ borderColor: '#2a2b2e' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#22232a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td className="px-4 py-3">
                  <span className="font-bold text-white text-sm">{h.symbol}</span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-white">
                  {h.quantity.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-sm text-white">{fmtPrice(h.avgCost)}</td>
                <td className="px-4 py-3 text-right text-sm" style={{ color: h.currentPrice > 0 ? '#fff' : '#858ca2' }}>
                  {fmtPrice(h.currentPrice)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-white">
                  {h.currentValue > 0 ? fmtMoney(h.currentValue, locale) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: pnlColor(h.unrealizedPnl) }}>
                  {h.currentValue > 0 ? fmtPnl(h.unrealizedPnl, locale) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: pnlColor(h.unrealizedPct) }}>
                  {h.currentValue > 0
                    ? `${h.unrealizedPct > 0 ? '+' : ''}${h.unrealizedPct.toFixed(2)}%`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
