import { fmtMoney, fmtPrice } from '../../lib/portfolio';
import type { HoldingWithPrice } from '../../lib/portfolio';

function pnlColor(v: number) {
  if (v > 0) return '#16c784';
  if (v < 0) return '#ea3943';
  return '#858ca2';
}

function fmtPnl(n: number) {
  return `${n > 0 ? '+' : ''}${fmtMoney(n)}`;
}

interface Props {
  holdings: HoldingWithPrice[];
  onSelectSymbol: (symbol: string) => void;
}

export function HoldingsTable({ holdings, onSelectSymbol }: Props) {
  if (holdings.length === 0) {
    return (
      <p className="text-sm text-[#858ca2] text-center py-8">
        Chưa có cổ phiếu nào. Thêm giao dịch mua để bắt đầu.
      </p>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#2a2b2e', backgroundColor: '#1a1b1e' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-xs font-medium uppercase tracking-wider" style={{ borderColor: '#2a2b2e', color: '#858ca2' }}>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3 text-right">Số CP</th>
              <th className="px-4 py-3 text-right">Giá vốn TB</th>
              <th className="px-4 py-3 text-right">Giá hiện tại</th>
              <th className="px-4 py-3 text-right">Giá trị</th>
              <th className="px-4 py-3 text-right">Lãi/lỗ</th>
              <th className="px-4 py-3 text-right">%</th>
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
                  {h.currentValue > 0 ? fmtMoney(h.currentValue) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: pnlColor(h.unrealizedPnl) }}>
                  {h.currentValue > 0 ? fmtPnl(h.unrealizedPnl) : '—'}
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
