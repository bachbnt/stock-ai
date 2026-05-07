import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Holding } from '../../lib/portfolio';
import { usePortfolioHistory } from '../../hooks/usePortfolio';
import { useT } from '../../contexts/I18nContext';

interface Props {
  holdings: Holding[];
}

export function PortfolioChart({ holdings }: Props) {
  const { t } = useT();
  const { data, isLoading } = usePortfolioHistory(holdings);

  if (holdings.length === 0) return null;

  if (isLoading) return <div className="skeleton h-48 rounded-xl" />;

  if (data.length === 0) {
    return <p className="text-sm text-[#858ca2] text-center py-4">{t('chart_no_data')}</p>;
  }

  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const isPositiveTrend = data[data.length - 1].value >= data[0].value;
  const lineColor = isPositiveTrend ? '#16c784' : '#ea3943';

  return (
    <div>
      <p className="text-xs text-[#858ca2] mb-2">{t('chart_portfolio_title')}</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2e" />
          <XAxis
            dataKey="date"
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
            width={65}
            domain={[minVal * 0.995, maxVal * 1.005]}
            tickFormatter={(v: number) => {
              if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}tỷ`;
              if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}tr`;
              if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
              return String(v);
            }}
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
            formatter={(value: number) => {
              const abs = Math.abs(value);
              const s = abs >= 1_000_000_000 ? `${(value / 1_000_000_000).toFixed(2)} tỷ`
                : abs >= 1_000_000 ? `${(value / 1_000_000).toFixed(2)} triệu`
                : `${(value / 1_000).toFixed(0)} nghìn`;
              return [s, t('chart_value_label')];
            }}
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
