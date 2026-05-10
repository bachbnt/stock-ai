import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Holding } from '@/lib/portfolio';
import { fmtMoney } from '@/lib/portfolio';
import { usePortfolioHistory } from '@/hooks/usePortfolio';
import { useT } from '@/contexts/I18nContext';
import { trendColor, COLOR_TEXT, COLOR_NONE, COLOR_BORDER, COLOR_BG_HOVER } from '@/lib/colors';

interface Props {
  holdings: Holding[];
}

export function PortfolioChart({ holdings }: Props) {
  const { t, locale } = useT();
  const { data, isLoading } = usePortfolioHistory(holdings);

  if (holdings.length === 0) return null;

  if (isLoading) return <div className="skeleton h-48 rounded-xl" />;

  if (data.length === 0) {
    return <p className="text-sm text-text-secondary text-center py-4">{t('chart_no_data')}</p>;
  }

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const isPositiveTrend = data[data.length - 1].value >= data[0].value;
  const lineColor = trendColor(isPositiveTrend);

  return (
    <div>
      <p className="text-xs text-text-secondary mb-2">{t('chart_portfolio_title')}</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
          <XAxis
            dataKey="date"
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
            width={65}
            domain={[minVal * 0.995, maxVal * 1.005]}
            tickFormatter={(v: number) => fmtMoney(v, locale)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: COLOR_BG_HOVER,
              border: `1px solid ${COLOR_BORDER}`,
              borderRadius: 8,
              color: COLOR_TEXT,
              fontSize: 12,
            }}
            labelFormatter={(v) => { const s = String(v); return `${s.slice(8, 10)}/${s.slice(5, 7)}`; }}
            formatter={(value) => [fmtMoney(typeof value === 'number' ? value : 0, locale), t('chart_value_label')]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}