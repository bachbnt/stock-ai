import { X } from 'lucide-react';
import { useStockHistory, useCompanyInfo } from '../hooks/useStock';
import type { CompanyInfo } from '../lib/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface StockDetailProps {
  symbol: string;
  name: string;
  onClose: () => void;
}

function formatVND(n: number): string {
  if (n === 0) return '0';
  return n.toFixed(3);
}

export function StockDetail({ symbol, name, onClose }: StockDetailProps) {
  const { data: history, isLoading: histLoading } = useStockHistory(symbol);
  const { data: company, isLoading: compLoading } = useCompanyInfo(symbol);

  const lastPrice = history && history.length > 0 ? history[history.length - 1].close : null;
  const prevPrice = history && history.length > 1 ? history[history.length - 2].close : null;
  const priceDiff = lastPrice != null && prevPrice != null ? lastPrice - prevPrice : null;
  const pricePct =
    priceDiff != null && prevPrice ? (priceDiff / prevPrice) * 100 : null;
  const isUp = priceDiff != null ? priceDiff >= 0 : null;
  const priceColor = isUp === null ? '#858ca2' : isUp ? '#16c784' : '#ea3943';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: '#1a1b1e', borderColor: '#2a2b2e' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: '#2a2b2e' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{symbol}</h2>
              {company && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: '#2a2b2e', color: '#858ca2' }}
                >
                  {String(company.exchange ?? '')}
                </span>
              )}
            </div>
            <p className="text-sm text-[#858ca2]">{name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[#22232a] text-[#858ca2] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Last price */}
          {lastPrice != null && (
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-white">{formatVND(lastPrice)}</span>
              {priceDiff != null && pricePct != null && (
                <span className="text-sm font-semibold mb-1" style={{ color: priceColor }}>
                  {isUp ? '+' : ''}
                  {formatVND(priceDiff)} ({isUp ? '+' : ''}
                  {pricePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}

          {/* Price chart */}
          {histLoading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : history && history.length > 0 ? (
            <div>
              <p className="text-xs text-[#858ca2] mb-2">Giá đóng cửa 90 ngày gần nhất</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2e" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#858ca2', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    tickFormatter={(v: string) => `${v.slice(8, 10)}/${v.slice(5, 7)}`}
                  />
                  <YAxis
                    tick={{ fill: '#858ca2', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => formatVND(v)}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#22232a',
                      border: '1px solid #2a2b2e',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 12,
                    }}
                    labelFormatter={(v: string) => `${v.slice(8, 10)}/${v.slice(5, 7)}`}
                    formatter={(value: number | string | (number | string)[]) => {
                      const num = typeof value === 'number' ? value : 0;
                      return [formatVND(num), 'Đóng cửa'];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#3861fb"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-[#858ca2]">Không có dữ liệu lịch sử.</p>
          )}

          {/* Company info */}
          {compLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : company ? (
            <CompanyInfoGrid company={company} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CompanyInfoGrid({ company }: { company: CompanyInfo }) {
  const fields = [
    { label: 'Sàn giao dịch', key: 'exchange' },
    { label: 'Ngày niêm yết', key: 'listing_date' },
    { label: 'Ngày thành lập', key: 'founded_date' },
    { label: 'Vốn điều lệ (tỷ)', key: 'charter_capital' },
    { label: 'Số nhân viên', key: 'number_of_employees' },
    { label: 'Tổng giám đốc', key: 'ceo_name' },
    { label: 'Website', key: 'website' },
    { label: 'Email', key: 'email' },
  ];

  const entries = fields
    .map((f) => ({ label: f.label, value: company[f.key] }))
    .filter((e) => e.value != null && e.value !== '');

  if (entries.length === 0) return null;

  return (
    <div>
      <p className="text-xs text-[#858ca2] mb-2">Thông tin công ty</p>
      <div className="grid grid-cols-2 gap-3">
        {entries.map((e) => (
          <div
            key={e.label}
            className="rounded-lg p-3 border"
            style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
          >
            <p className="text-xs text-[#858ca2] mb-1">{e.label}</p>
            <p className="text-sm font-semibold text-white truncate">{String(e.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
