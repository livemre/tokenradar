'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, type IChartApi } from 'lightweight-charts';
import { Spinner } from '@/components/ui/Spinner';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

/** Format price for chart Y-axis — handles very small memecoin prices */
function formatChartPrice(price: number): string {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  if (price >= 0.0000001) return price.toFixed(10);
  return price.toExponential(4);
}

// Poll intervals per timeframe (ms)
const POLL_INTERVALS: Record<string, number> = {
  '1m': 15_000,
  '5m': 30_000,
  '15m': 30_000,
  '1h': 60_000,
  '4h': 60_000,
  '1d': 120_000,
};

export function PriceChart({ mint }: { mint: string }) {
  const t = useTranslations('priceChart');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async (): Promise<CandleData[]> => {
    try {
      const res = await fetch(`/api/tokens/${mint}/ohlcv?timeframe=${timeframe}`);
      const { data } = await res.json();
      return data || [];
    } catch {
      return [];
    }
  }, [mint, timeframe]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    candleSeriesRef.current = null;
    volumeSeriesRef.current = null;
    lastTimeRef.current = 0;
    setIsLive(false);

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#666',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(255,255,255,0.1)', width: 1, style: 3 },
        horzLine: { color: 'rgba(255,255,255,0.1)', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartInstance.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff3366',
      borderDownColor: '#ff3366',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff3366',
      wickUpColor: '#00ff88',
      priceFormat: {
        type: 'custom',
        formatter: formatChartPrice,
      },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    setLoading(true);

    // Initial data load
    fetchData().then((data) => {
      if (data.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }

      setHasData(true);

      candleSeries.setData(
        data.map((d) => ({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );

      volumeSeries.setData(
        data.map((d) => ({
          time: d.time as any,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,102,0.15)',
        }))
      );

      chart.timeScale().fitContent();
      lastTimeRef.current = data[data.length - 1].time;
      setLoading(false);
      setIsLive(true);
    });

    // Polling for live updates
    const pollInterval = setInterval(async () => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

      const data = await fetchData();
      if (data.length === 0) return;

      // Update candles from the last known time onwards
      const newCandles = data.filter((d) => d.time >= lastTimeRef.current);

      for (const d of newCandles) {
        candleSeriesRef.current.update({
          time: d.time as any,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        });
        volumeSeriesRef.current.update({
          time: d.time as any,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,102,0.15)',
        });
      }

      if (data.length > 0) {
        lastTimeRef.current = data[data.length - 1].time;
      }
    }, POLL_INTERVALS[timeframe] || 30_000);

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartInstance.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [mint, timeframe, fetchData]);

  return (
    <div className="p-4">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 mb-3">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors btn-press focus-ring ${
              timeframe === tf
                ? 'bg-white/10 text-foreground'
                : 'text-muted hover:text-foreground hover:bg-white/5'
            }`}
          >
            {tf.toUpperCase()}
          </button>
        ))}

        {/* Live indicator */}
        {isLive && (
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-safe" />
            </span>
            {t('live')}
          </div>
        )}
      </div>

      {/* Chart container */}
      <div className="relative rounded-xl overflow-hidden bg-white/[0.02] border border-white/5 ring-1 ring-white/5">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10 gap-2">
            <Spinner size={20} />
            <span className="text-xs text-muted">{t('loading')}</span>
          </div>
        )}
        {!hasData && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <BarChart3 size={32} className="text-muted mb-2" />
            <p className="text-sm text-muted">{t('noData')}</p>
            <p className="text-xs text-muted mt-1">{t('noDataDesc')}</p>
          </div>
        )}
        <div ref={chartRef} style={{ width: '100%', height: 350 }} />
      </div>
    </div>
  );
}
