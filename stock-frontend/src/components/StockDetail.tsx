import { useState } from 'react';
import { X } from 'lucide-react';
import { useStockHistory, useCompanyInfo } from '@/hooks/useStock';
import { useT } from '@/contexts/I18nContext';
import { CandleChart } from './CandleChart';
import { quoteColor, COLOR_UP, COLOR_DOWN, COLOR_TEXT, COLOR_NONE, COLOR_BORDER, COLOR_BG_PRIMARY, COLOR_BG_CARD, COLOR_BG_HOVER, COLOR_ACCENT } from '@/lib/colors';
import type { StockHistoryItem } from '@/lib/api';
import type { CompanyInfo } from '@/lib/api';
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

type TabId = 'chart' | 'company' | 'business' | 'history' | 'data';

export function StockDetail({ symbol, name, onClose }: StockDetailProps) {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<TabId>('chart');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const { data: history, isLoading: histLoading } = useStockHistory(symbol);
  const { data: company, isLoading: compLoading } = useCompanyInfo(symbol);

  const lastPrice = history && history.length > 0 ? history[history.length - 1].close : null;
  const prevPrice = history && history.length > 1 ? history[history.length - 2].close : null;
  const priceDiff = lastPrice != null && prevPrice != null ? lastPrice - prevPrice : null;
  const pricePct = priceDiff != null && prevPrice ? (priceDiff / prevPrice) * 100 : null;
  const detailPriceColor = quoteColor(lastPrice != null, priceDiff);

  const hasBusiness = !!(company?.business_model && String(company.business_model).trim());
  const hasHistory = !!(company?.history && String(company.history).trim());

  const hasData = !!(history && history.length > 0);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'chart', label: t('detail_tab_chart') },
    { id: 'company', label: t('detail_tab_company') },
    ...(hasBusiness ? [{ id: 'business' as const, label: t('detail_tab_business') }] : []),
    ...(hasHistory ? [{ id: 'history' as const, label: t('detail_tab_history') }] : []),
    ...(hasData ? [{ id: 'data' as const, label: t('detail_tab_data') }] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: COLOR_BG_CARD, borderColor: COLOR_BORDER }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{symbol}</h2>
              {company && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: COLOR_BORDER, color: COLOR_NONE }}
                >
                  {String(company.exchange ?? '')}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">{name}</p>
          </div>

          <div className="flex items-center gap-3">
            {lastPrice != null && (
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: detailPriceColor }}>{formatVND(lastPrice)}</p>
                {priceDiff != null && pricePct != null && (
                  <p className="text-xs font-semibold" style={{ color: detailPriceColor }}>
                    {priceDiff > 0 ? '+' : ''}
                    {Math.round(priceDiff * 1000).toLocaleString()} ({priceDiff > 0 ? '+' : ''}
                    {pricePct.toFixed(2)}%)
                  </p>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-bg-hover text-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5" style={{ borderColor: COLOR_BORDER }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                color: activeTab === tab.id ? COLOR_TEXT : COLOR_NONE,
                borderBottom: activeTab === tab.id ? `2px solid ${COLOR_ACCENT}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Chart tab */}
          {activeTab === 'chart' && (
            histLoading ? (
              <div className="skeleton h-64 rounded-xl" />
            ) : history && history.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-text-secondary">{t('detail_chart_title')}</p>
                  <div
                    className="flex rounded-lg overflow-hidden border text-xs"
                    style={{ borderColor: COLOR_BORDER }}
                  >
                    {(['line', 'candle'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className="px-3 py-1 transition-colors"
                        style={{
                          backgroundColor: chartType === type ? COLOR_ACCENT : COLOR_BG_HOVER,
                          color: chartType === type ? COLOR_TEXT : COLOR_NONE,
                        }}
                      >
                        {t(type === 'line' ? 'chart_type_line' : 'chart_type_candle')}
                      </button>
                    ))}
                  </div>
                </div>
                {chartType === 'line' ? (
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={history} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: COLOR_NONE, fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={(v: string) => `${v.slice(8, 10)}/${v.slice(5, 7)}`}
                      />
                      <YAxis
                        tick={{ fill: COLOR_NONE, fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => formatVND(v)}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLOR_BG_HOVER,
                          border: `1px solid ${COLOR_BORDER}`,
                          borderRadius: 8,
                          color: COLOR_TEXT,
                          fontSize: 12,
                        }}
                        labelFormatter={(v: string) => `${v.slice(8, 10)}/${v.slice(5, 7)}`}
                        formatter={(value: number | string | (number | string)[]) => {
                          const num = typeof value === 'number' ? value : 0;
                          return [formatVND(num), t('detail_close')];
                        }}
                      />
                      <Line type="monotone" dataKey="close" stroke="#3861fb" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <CandleChart data={history} height={500} />
                )}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">{t('detail_no_history')}</p>
            )
          )}

          {/* Company info tab */}
          {activeTab === 'company' && (
            compLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
              </div>
            ) : company ? (
              <CompanyInfoGrid company={company} />
            ) : null
          )}

          {/* Business model tab */}
          {activeTab === 'business' && hasBusiness && (
            <LongTextBlock text={String(company!.business_model)} />
          )}

          {/* History tab */}
          {activeTab === 'history' && hasHistory && (
            <LongTextBlock text={String(company!.history)} />
          )}

          {/* Data tab */}
          {activeTab === 'data' && hasData && (
            <HistoryDataTable data={history!} />
          )}
        </div>
      </div>
    </div>
  );
}

function CompanyInfoGrid({ company }: { company: CompanyInfo }) {
  const { t } = useT();

  const fields = [
    { label: t('detail_field_exchange'), key: 'exchange' },
    { label: t('detail_field_company_type'), key: 'company_type' },
    { label: t('detail_field_listing_date'), key: 'listing_date' },
    { label: t('detail_field_founded_date'), key: 'founded_date' },
    { label: t('detail_field_charter_capital'), key: 'charter_capital' },
    { label: t('detail_field_employees'), key: 'number_of_employees' },
    { label: t('detail_field_ceo'), key: 'ceo_name' },
    { label: t('detail_field_ceo_title'), key: 'ceo_position' },
    { label: t('detail_field_inspector'), key: 'inspector_name' },
    { label: t('detail_field_auditor'), key: 'auditor' },
    { label: t('detail_field_tax_id'), key: 'tax_id' },
    { label: t('detail_field_phone'), key: 'phone' },
    { label: t('detail_field_fax'), key: 'fax' },
    { label: t('detail_field_email'), key: 'email' },
    { label: t('detail_field_website'), key: 'website' },
  ];

  const gridEntries = fields
    .map((f) => ({ label: f.label, value: company[f.key] }))
    .filter((e) => e.value != null && e.value !== '');

  const address = company.address ? String(company.address) : null;
  const branches = company.branches ? String(company.branches).trim() : null;

  if (gridEntries.length === 0 && !address && !branches) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {gridEntries.map((e) => (
          <div
            key={e.label}
            className="rounded-lg p-3 border"
            style={{ backgroundColor: COLOR_BG_PRIMARY, borderColor: COLOR_BORDER }}
          >
            <p className="text-xs text-text-secondary mb-1">{e.label}</p>
            <p className="text-sm font-semibold text-white truncate">{String(e.value)}</p>
          </div>
        ))}
      </div>
      {address && (
        <div className="rounded-lg p-3 border" style={{ backgroundColor: COLOR_BG_PRIMARY, borderColor: COLOR_BORDER }}>
          <p className="text-xs text-text-secondary mb-1">{t('detail_field_address')}</p>
          <p className="text-sm font-semibold text-white">{address}</p>
        </div>
      )}
      {branches && (
        <div className="rounded-lg p-3 border" style={{ backgroundColor: COLOR_BG_PRIMARY, borderColor: COLOR_BORDER }}>
          <p className="text-xs text-text-secondary mb-1">{t('detail_field_branches')}</p>
          <p className="text-sm text-white whitespace-pre-line leading-relaxed">{branches}</p>
        </div>
      )}
    </div>
  );
}

function LongTextBlock({ text }: { text: string }) {
  return (
    <div className="rounded-lg p-4 border" style={{ backgroundColor: COLOR_BG_PRIMARY, borderColor: COLOR_BORDER }}>
      <p className="text-sm text-[#c8ccd8] whitespace-pre-line leading-relaxed">{text.trim()}</p>
    </div>
  );
}

function HistoryDataTable({ data }: { data: StockHistoryItem[] }) {
  const { t } = useT();

  const sorted = [...data].sort((a, b) => b.time.localeCompare(a.time));

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: COLOR_BORDER, backgroundColor: COLOR_BG_PRIMARY }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b text-xs font-medium uppercase tracking-wider"
              style={{ borderColor: COLOR_BORDER, color: COLOR_NONE }}
            >
              <th className="px-4 py-3">{t('detail_data_col_date')}</th>
              <th className="px-4 py-3 text-right">{t('detail_data_col_open')}</th>
              <th className="px-4 py-3 text-right">{t('detail_data_col_high')}</th>
              <th className="px-4 py-3 text-right">{t('detail_data_col_low')}</th>
              <th className="px-4 py-3 text-right">{t('detail_data_col_close')}</th>
              <th className="px-4 py-3 text-right">{t('detail_data_col_change')}</th>
              <th className="px-4 py-3 text-right">{t('detail_data_col_volume')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const prevClose = sorted[i + 1]?.close ?? null;
              const changePct = prevClose != null && prevClose !== 0
                ? ((row.close - prevClose) / prevClose) * 100
                : null;
              const closeColor = quoteColor(true, changePct);
              return (
                <tr key={row.time} className="border-b" style={{ borderColor: COLOR_BORDER }}>
                  <td className="px-4 py-2" style={{ color: COLOR_NONE }}>
                    {`${row.time.slice(8, 10)}/${row.time.slice(5, 7)}/${row.time.slice(0, 4)}`}
                  </td>
                  <td className="px-4 py-2 text-right" style={{ color: COLOR_TEXT }}>{formatVND(row.open)}</td>
                  <td className="px-4 py-2 text-right font-semibold" style={{ color: COLOR_UP }}>{formatVND(row.high)}</td>
                  <td className="px-4 py-2 text-right font-semibold" style={{ color: COLOR_DOWN }}>{formatVND(row.low)}</td>
                  <td className="px-4 py-2 text-right font-semibold" style={{ color: closeColor }}>{formatVND(row.close)}</td>
                  <td className="px-4 py-2 text-right font-semibold leading-tight" style={{ color: closeColor }}>
                    {changePct != null && prevClose != null ? (
                      <>
                        <span className="block">
                          {row.close - prevClose > 0 ? '+' : ''}
                          {formatVND(row.close - prevClose)}
                        </span>
                        <span className="block text-xs opacity-80">
                          {changePct > 0 ? '+' : ''}{changePct.toFixed(2)}%
                        </span>
                      </>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right" style={{ color: COLOR_NONE }}>
                    {row.volume.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
