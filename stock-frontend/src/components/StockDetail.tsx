import { useState } from 'react';
import { X } from 'lucide-react';
import { useStockHistory, useCompanyInfo } from '../hooks/useStock';
import { useT } from '../contexts/I18nContext';
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
  const { t } = useT();
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: '#1a1b1e', borderColor: '#2a2b2e' }}
        onClick={(e) => e.stopPropagation()}
      >
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
          {lastPrice != null && (
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-white">{formatVND(lastPrice)}</span>
              {priceDiff != null && pricePct != null && (
                <span className="text-sm font-semibold mb-1" style={{ color: priceColor }}>
                  {isUp ? '+' : ''}
                  {Math.round(priceDiff * 1000).toLocaleString('vi-VN')} ({isUp ? '+' : ''}
                  {pricePct.toFixed(2)}%)
                </span>
              )}
            </div>
          )}

          {histLoading ? (
            <div className="skeleton h-48 rounded-xl" />
          ) : history && history.length > 0 ? (
            <div>
              <p className="text-xs text-[#858ca2] mb-2">{t('detail_chart_title')}</p>
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
                      return [formatVND(num), t('detail_close')];
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
            <p className="text-sm text-[#858ca2]">{t('detail_no_history')}</p>
          )}

          {compLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : company ? (
            <CompanyInfoSection company={company} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

type TabId = 'info' | 'business' | 'history';

function CompanyInfoSection({ company }: { company: CompanyInfo }) {
  const { t } = useT();
  const [tab, setTab] = useState<TabId>('info');

  const hasBusiness = !!(company.business_model && String(company.business_model).trim());
  const hasHistory = !!(company.history && String(company.history).trim());

  const tabs: { id: TabId; label: string }[] = [
    { id: 'info', label: t('detail_tab_info') },
    ...(hasBusiness ? [{ id: 'business' as const, label: t('detail_tab_business') }] : []),
    ...(hasHistory ? [{ id: 'history' as const, label: t('detail_tab_history') }] : []),
  ];

  return (
    <div>
      <div className="flex gap-0 mb-3 border-b" style={{ borderColor: '#2a2b2e' }}>
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className="px-4 py-2 text-xs font-medium transition-colors"
            style={{
              color: tab === tb.id ? '#fff' : '#858ca2',
              borderBottom: tab === tb.id ? '2px solid #3861fb' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'info' && <CompanyInfoGrid company={company} />}
      {tab === 'business' && hasBusiness && (
        <LongTextBlock text={String(company.business_model)} />
      )}
      {tab === 'history' && hasHistory && (
        <LongTextBlock text={String(company.history)} />
      )}
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
            style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
          >
            <p className="text-xs text-[#858ca2] mb-1">{e.label}</p>
            <p className="text-sm font-semibold text-white truncate">{String(e.value)}</p>
          </div>
        ))}
      </div>

      {address && (
        <div
          className="rounded-lg p-3 border"
          style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
        >
          <p className="text-xs text-[#858ca2] mb-1">{t('detail_field_address')}</p>
          <p className="text-sm font-semibold text-white">{address}</p>
        </div>
      )}

      {branches && (
        <div
          className="rounded-lg p-3 border"
          style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
        >
          <p className="text-xs text-[#858ca2] mb-1">{t('detail_field_branches')}</p>
          <p className="text-sm text-white whitespace-pre-line leading-relaxed">{branches}</p>
        </div>
      )}
    </div>
  );
}

function LongTextBlock({ text }: { text: string }) {
  return (
    <div
      className="rounded-lg p-4 border"
      style={{ backgroundColor: '#0d0e11', borderColor: '#2a2b2e' }}
    >
      <p className="text-sm text-[#c8ccd8] whitespace-pre-line leading-relaxed">{text.trim()}</p>
    </div>
  );
}
