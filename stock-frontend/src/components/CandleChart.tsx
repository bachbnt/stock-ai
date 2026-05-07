import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { SMA, RSI, MACD } from 'technicalindicators';
import type { StockHistoryItem } from '../lib/api';

interface Props {
  data: StockHistoryItem[];
  height?: number;
}

export function CandleChart({ data, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || data.length === 0) return;

    const chart = createChart(el, {
      layout: {
        background: { color: '#1a1b1e' },
        textColor: '#858ca2',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#2a2b2e' },
        horzLines: { color: '#2a2b2e' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#2a2b2e' },
      timeScale: { borderColor: '#2a2b2e', timeVisible: false },
      width: el.clientWidth,
      height,
    });

    // Pane 0 — candlestick
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#16c784',
      downColor: '#ea3943',
      borderUpColor: '#16c784',
      borderDownColor: '#ea3943',
      wickUpColor: '#16c784',
      wickDownColor: '#ea3943',
    });
    const date = (t: string) => t.slice(0, 10);

    candleSeries.setData(
      data.map((d) => ({ time: date(d.time), open: d.open, high: d.high, low: d.low, close: d.close })),
    );

    // MA20 overlay on pane 0
    const closes = data.map((d) => d.close);
    const ma20 = SMA.calculate({ period: 20, values: closes });
    const ma20Off = closes.length - ma20.length;
    const ma20Series = chart.addSeries(LineSeries, {
      color: '#f0b90b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    ma20Series.setData(ma20.map((v, i) => ({ time: date(data[i + ma20Off].time), value: v })));

    // Pane 1 — volume
    const volPane = chart.addPane();
    volPane.setStretchFactor(0.28);
    const volSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' } }, 1);
    volSeries.setData(
      data.map((d) => ({
        time: date(d.time),
        value: d.volume,
        color: d.close >= d.open ? '#16c78433' : '#ea394333',
      })),
    );

    // Pane 2 — MACD
    const macdPane = chart.addPane();
    macdPane.setStretchFactor(0.32);
    const macdResult = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });
    const macdOff = closes.length - macdResult.length;

    const macdLineSeries = chart.addSeries(
      LineSeries,
      { color: '#3861fb', lineWidth: 1, priceLineVisible: false, lastValueVisible: false },
      2,
    );
    const macdSignalSeries = chart.addSeries(
      LineSeries,
      { color: '#f59e0b', lineWidth: 1, priceLineVisible: false, lastValueVisible: false },
      2,
    );
    const macdHistSeries = chart.addSeries(HistogramSeries, {}, 2);

    macdLineSeries.setData(
      macdResult.map((v, i) => ({ time: date(data[i + macdOff].time), value: v.MACD ?? 0 })),
    );
    macdSignalSeries.setData(
      macdResult.map((v, i) => ({ time: date(data[i + macdOff].time), value: v.signal ?? 0 })),
    );
    macdHistSeries.setData(
      macdResult.map((v, i) => ({
        time: date(data[i + macdOff].time),
        value: v.histogram ?? 0,
        color: (v.histogram ?? 0) >= 0 ? '#16c78466' : '#ea394366',
      })),
    );

    // Pane 3 — RSI
    const rsiPane = chart.addPane();
    rsiPane.setStretchFactor(0.28);
    const rsiResult = RSI.calculate({ period: 14, values: closes });
    const rsiOff = closes.length - rsiResult.length;
    const rsiSeries = chart.addSeries(
      LineSeries,
      { color: '#a855f7', lineWidth: 1, priceLineVisible: false, lastValueVisible: false },
      3,
    );
    rsiSeries.setData(
      rsiResult.map((v, i) => ({ time: date(data[i + rsiOff].time), value: v })),
    );

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (el) chart.applyOptions({ width: el.clientWidth });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [data, height]);

  return <div ref={containerRef} style={{ width: '100%' }} />;
}
