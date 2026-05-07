import { useEffect, useRef } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { SMA, RSI, MACD } from 'technicalindicators';
import type { StockHistoryItem } from '@/lib/api';
import {
  COLOR_UP,
  COLOR_DOWN,
  COLOR_FLAT,
  COLOR_NONE,
  COLOR_BG_CARD,
  COLOR_BORDER,
  COLOR_ACCENT,
} from '@/lib/colors';

// Chart-specific indicator colors (not part of the main palette)
const MA_CONFIGS = [
  { period: 5,  color: '#22d3ee', label: 'MA5'  },
  { period: 10, color: '#818cf8', label: 'MA10' },
  { period: 20, color: COLOR_FLAT, label: 'MA20' },
  { period: 50, color: '#f97316', label: 'MA50' },
];
const COLOR_MACD_SIGNAL = '#f59e0b';
const COLOR_RSI         = '#a855f7';
const COLOR_LEGEND_LABEL = '#aaa';
const COLOR_LEGEND_TEXT  = '#c8ccd8';

interface Props {
  data: StockHistoryItem[];
  height?: number;
}

function val(seriesData: Map<object, unknown>, series: object): number | null {
  const d = seriesData.get(series) as { value?: number; close?: number } | undefined;
  if (!d) return null;
  if (d.value != null) return d.value;
  if (d.close != null) return d.close;
  return null;
}

export function CandleChart({ data, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || data.length === 0) return;

    const chart = createChart(el, {
      layout: { background: { color: COLOR_BG_CARD }, textColor: COLOR_NONE, fontSize: 11 },
      grid: { vertLines: { color: COLOR_BORDER }, horzLines: { color: COLOR_BORDER } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: COLOR_BORDER },
      timeScale: { borderColor: COLOR_BORDER, timeVisible: false },
      width: el.clientWidth,
      height,
    });

    const date = (t: string) => t.slice(0, 10);
    const closes = data.map((d) => d.close);

    // Pane 0 — candlestick
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: COLOR_UP, downColor: COLOR_DOWN,
      borderUpColor: COLOR_UP, borderDownColor: COLOR_DOWN,
      wickUpColor: COLOR_UP, wickDownColor: COLOR_DOWN,
    });
    candleSeries.setData(
      data.map((d) => ({ time: date(d.time), open: d.open, high: d.high, low: d.low, close: d.close })),
    );

    // MA lines on pane 0
    const maSeriesArr = MA_CONFIGS
      .filter(({ period }) => period < data.length)
      .map(({ period, color, label }) => {
        const values = SMA.calculate({ period, values: closes });
        const off = closes.length - values.length;
        const series = chart.addSeries(LineSeries, {
          color, lineWidth: 1,
          priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
        });
        series.setData(values.map((v, i) => ({ time: date(data[i + off].time), value: v })));
        return { series, label, color };
      });

    // Pane 1 — volume
    const volPane = chart.addPane();
    volPane.setStretchFactor(0.25);
    const volSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' } }, 1);
    volSeries.setData(
      data.map((d) => ({
        time: date(d.time), value: d.volume,
        color: d.close >= d.open ? COLOR_UP + '33' : COLOR_DOWN + '33',
      })),
    );

    // Pane 2 — MACD
    const macdPane = chart.addPane();
    macdPane.setStretchFactor(0.3);
    const macdResult = MACD.calculate({
      values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9,
      SimpleMAOscillator: false, SimpleMASignal: false,
    });
    const macdOff = closes.length - macdResult.length;
    const macdLineSeries = chart.addSeries(
      LineSeries, { color: COLOR_ACCENT, lineWidth: 1, priceLineVisible: false, lastValueVisible: false }, 2,
    );
    const macdSignalSeries = chart.addSeries(
      LineSeries, { color: COLOR_MACD_SIGNAL, lineWidth: 1, priceLineVisible: false, lastValueVisible: false }, 2,
    );
    const macdHistSeries = chart.addSeries(HistogramSeries, { lastValueVisible: false }, 2);
    macdLineSeries.setData(macdResult.map((v, i) => ({ time: date(data[i + macdOff].time), value: v.MACD ?? 0 })));
    macdSignalSeries.setData(macdResult.map((v, i) => ({ time: date(data[i + macdOff].time), value: v.signal ?? 0 })));
    macdHistSeries.setData(macdResult.map((v, i) => ({
      time: date(data[i + macdOff].time), value: v.histogram ?? 0,
      color: (v.histogram ?? 0) >= 0 ? COLOR_UP + '66' : COLOR_DOWN + '66',
    })));

    // Pane 3 — RSI
    const rsiPane = chart.addPane();
    rsiPane.setStretchFactor(0.25);
    const rsiResult = RSI.calculate({ period: 14, values: closes });
    const rsiOff = closes.length - rsiResult.length;
    const rsiSeries = chart.addSeries(
      LineSeries, { color: COLOR_RSI, lineWidth: 1, priceLineVisible: false, lastValueVisible: false }, 3,
    );
    rsiSeries.setData(rsiResult.map((v, i) => ({ time: date(data[i + rsiOff].time), value: v })));

    chart.timeScale().fitContent();

    // Legend — update on crosshair move
    function renderLegend(seriesData: Map<object, unknown>, time?: unknown) {
      const legend = legendRef.current;
      if (!legend) return;

      const cd = seriesData.get(candleSeries) as
        | { open: number; high: number; low: number; close: number }
        | undefined;

      const dateStr = typeof time === 'string'
        ? `${time.slice(8, 10)}/${time.slice(5, 7)}/${time.slice(0, 4)}`
        : '';
      const bullish = cd ? cd.close >= cd.open : true;
      const ohlcColor = bullish ? COLOR_UP : COLOR_DOWN;

      const ohlcHtml = cd
        ? `<span style="color:${COLOR_NONE};margin-right:6px">${dateStr}</span>` +
          `<span style="color:${COLOR_LEGEND_LABEL}">O</span><span style="color:${ohlcColor}"> ${cd.open.toFixed(3)}</span> ` +
          `<span style="color:${COLOR_LEGEND_LABEL}">H</span><span style="color:${COLOR_UP}"> ${cd.high.toFixed(3)}</span> ` +
          `<span style="color:${COLOR_LEGEND_LABEL}">L</span><span style="color:${COLOR_DOWN}"> ${cd.low.toFixed(3)}</span> ` +
          `<span style="color:${COLOR_LEGEND_LABEL}">C</span><span style="color:${ohlcColor};font-weight:600"> ${cd.close.toFixed(3)}</span>`
        : '';

      const maHtml = maSeriesArr.map(({ series, label, color }) => {
        const v = val(seriesData, series);
        return v != null
          ? `<span style="color:${color}">${label}: ${v.toFixed(3)}</span>`
          : '';
      }).join('');

      const macdV = val(seriesData, macdLineSeries);
      const signalV = val(seriesData, macdSignalSeries);
      const histV = val(seriesData, macdHistSeries);
      const macdHtml = [
        macdV != null ? `<span style="color:${COLOR_ACCENT}">MACD: ${macdV.toFixed(2)}</span>` : '',
        signalV != null ? `<span style="color:${COLOR_MACD_SIGNAL}">Sig: ${signalV.toFixed(2)}</span>` : '',
        histV != null
          ? `<span style="color:${histV >= 0 ? COLOR_UP : COLOR_DOWN}">Hist: ${histV.toFixed(2)}</span>`
          : '',
      ].filter(Boolean).join('  ');

      const rsiV = val(seriesData, rsiSeries);
      const rsiColor = rsiV == null ? COLOR_RSI : rsiV > 70 ? COLOR_DOWN : rsiV < 30 ? COLOR_UP : COLOR_RSI;
      const rsiHtml = rsiV != null
        ? `<span style="color:${rsiColor}">RSI: ${rsiV.toFixed(1)}${rsiV > 70 ? ' ↑OB' : rsiV < 30 ? ' ↓OS' : ''}</span>`
        : '';

      const sep = `<span style="color:${COLOR_BORDER};margin:0 4px">|</span>`;
      const row1Parts = [ohlcHtml, maHtml].filter(Boolean);
      const row2Parts = [macdHtml, rsiHtml].filter(Boolean);

      legend.innerHTML =
        `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;line-height:1.6">${row1Parts.join(sep)}</div>` +
        (row2Parts.length
          ? `<div style="display:flex;gap:10px;align-items:center;margin-top:1px">${row2Parts.join(sep)}</div>`
          : '');
    }

    renderLegend(new Map(), data[data.length - 1]?.time);

    chart.subscribeCrosshairMove((param) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderLegend(param.seriesData as unknown as Map<object, unknown>, param.time);
    });

    const ro = new ResizeObserver(() => { if (el) chart.applyOptions({ width: el.clientWidth }); });
    ro.observe(el);

    return () => { ro.disconnect(); chart.remove(); };
  }, [data, height]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={legendRef}
        style={{
          position: 'absolute', top: 6, left: 8, zIndex: 10,
          fontSize: 11, pointerEvents: 'none',
          color: COLOR_LEGEND_TEXT, lineHeight: 1.5,
        }}
      />
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}
