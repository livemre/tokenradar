'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createTextWatermark,
  type IChartApi,
} from 'lightweight-charts';
import { Spinner } from '@/components/ui/Spinner';
import { BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChartLegend, type LegendData } from './ChartLegend';
import { ChartToolbar } from './ChartToolbar';
import { formatChartPrice } from '@/lib/utils/chart-helpers';
import { computeSMA } from '@/lib/utils/chart-indicators';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

const POLL_INTERVALS: Record<string, number> = {
  '1m': 60_000,
  '5m': 60_000,
  '15m': 120_000,
  '1h': 120_000,
  '4h': 300_000,
  '1d': 300_000,
};

interface PriceChartProps {
  mint: string;
  symbol?: string;
}

export function PriceChart({ mint, symbol }: PriceChartProps) {
  const t = useTranslations('priceChart');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sma7SeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sma25SeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const priceLineRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const allDataRef = useRef<CandleData[]>([]);

  const [timeframe, setTimeframe] = useState<string>('15m');
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [legendData, setLegendData] = useState<LegendData | null>(null);

  const fetchData = useCallback(async (): Promise<CandleData[]> => {
    try {
      const res = await fetch(`/api/tokens/${mint}/ohlcv?timeframe=${timeframe}`);
      const { data } = await res.json();
      return data || [];
    } catch {
      return [];
    }
  }, [mint, timeframe]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Screenshot
  const handleScreenshot = useCallback(() => {
    if (!chartInstance.current) return;
    const canvas = chartInstance.current.takeScreenshot();
    const link = document.createElement('a');
    link.download = `${symbol || mint.slice(0, 8)}-${timeframe}-chart.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [symbol, mint, timeframe]);

  // Zoom helpers
  const zoomIn = useCallback(() => {
    const chart = chartInstance.current;
    if (!chart) return;
    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;
    const center = (range.from + range.to) / 2;
    const halfSpan = (range.to - range.from) / 2;
    const newHalf = halfSpan * 0.7;
    chart.timeScale().setVisibleLogicalRange({ from: center - newHalf, to: center + newHalf });
  }, []);

  const zoomOut = useCallback(() => {
    const chart = chartInstance.current;
    if (!chart) return;
    const range = chart.timeScale().getVisibleLogicalRange();
    if (!range) return;
    const center = (range.from + range.to) / 2;
    const halfSpan = (range.to - range.from) / 2;
    const newHalf = halfSpan * 1.3;
    chart.timeScale().setVisibleLogicalRange({ from: center - newHalf, to: center + newHalf });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case '+': case '=': zoomIn(); break;
        case '-': zoomOut(); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 's': case 'S': if (!e.ctrlKey && !e.metaKey) setShowSMA((p) => !p); break;
        case 'v': case 'V': if (!e.ctrlKey && !e.metaKey) setShowVolume((p) => !p); break;
        case '1': setTimeframe('1m'); break;
        case '2': setTimeframe('5m'); break;
        case '3': setTimeframe('15m'); break;
        case '4': setTimeframe('1h'); break;
        case '5': setTimeframe('4h'); break;
        case '6': setTimeframe('1d'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, toggleFullscreen]);

  // SMA visibility toggle
  useEffect(() => {
    if (sma7SeriesRef.current) sma7SeriesRef.current.applyOptions({ visible: showSMA });
    if (sma25SeriesRef.current) sma25SeriesRef.current.applyOptions({ visible: showSMA });
  }, [showSMA]);

  // Volume visibility toggle
  useEffect(() => {
    if (volumeSeriesRef.current) volumeSeriesRef.current.applyOptions({ visible: showVolume });
  }, [showVolume]);

  // Chart height: 350px normal, fill screen in fullscreen
  const chartHeight = isFullscreen ? 'calc(100vh - 52px)' : '350px';

  // Main chart creation effect
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.remove();
      chartInstance.current = null;
    }

    candleSeriesRef.current = null;
    volumeSeriesRef.current = null;
    sma7SeriesRef.current = null;
    sma25SeriesRef.current = null;
    priceLineRef.current = null;
    lastTimeRef.current = 0;
    allDataRef.current = [];
    setIsLive(false);
    setLegendData(null);

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
      localization: {
        timeFormatter: (time: number) => {
          const d = new Date(time * 1000);
          return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartInstance.current = chart;

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff88',
      downColor: '#ff3366',
      borderDownColor: '#ff3366',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff336680',
      wickUpColor: '#00ff8880',
      priceFormat: {
        type: 'custom',
        formatter: formatChartPrice,
      },
    });

    // Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      visible: showVolume,
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // SMA line series (start hidden)
    const sma7Series = chart.addSeries(LineSeries, {
      color: '#2962FF',
      lineWidth: 1,
      priceScaleId: 'right',
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      visible: showSMA,
    });

    const sma25Series = chart.addSeries(LineSeries, {
      color: '#FF6D00',
      lineWidth: 1,
      priceScaleId: 'right',
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      visible: showSMA,
    });

    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    sma7SeriesRef.current = sma7Series;
    sma25SeriesRef.current = sma25Series;

    // Watermark with token symbol
    try {
      const firstPane = chart.panes()[0];
      createTextWatermark(firstPane, {
        horzAlign: 'center',
        vertAlign: 'center',
        lines: [
          {
            text: symbol || mint.slice(0, 8),
            color: 'rgba(255, 255, 255, 0.04)',
            fontSize: 48,
            fontStyle: 'bold',
          },
        ],
      });
    } catch {
      // Watermark API may not be available in all builds
    }

    // Crosshair legend
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        // Show last candle data when not hovering
        const data = allDataRef.current;
        if (data.length > 0) {
          const last = data[data.length - 1];
          const sma7Data = param.seriesData?.get(sma7Series);
          const sma25Data = param.seriesData?.get(sma25Series);
          setLegendData({
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            volume: last.volume,
            sma7: null,
            sma25: null,
          });
        }
        return;
      }

      const candleData = param.seriesData.get(candleSeries);
      if (candleData && 'open' in candleData) {
        const volumeData = param.seriesData.get(volumeSeries);
        const sma7Data = param.seriesData.get(sma7Series);
        const sma25Data = param.seriesData.get(sma25Series);
        setLegendData({
          open: (candleData as any).open,
          high: (candleData as any).high,
          low: (candleData as any).low,
          close: (candleData as any).close,
          volume: volumeData && 'value' in volumeData ? (volumeData as any).value : 0,
          sma7: sma7Data && 'value' in sma7Data ? (sma7Data as any).value : null,
          sma25: sma25Data && 'value' in sma25Data ? (sma25Data as any).value : null,
        });
      }
    });

    setLoading(true);

    // Initial data load
    fetchData().then((data) => {
      if (data.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }

      setHasData(true);
      allDataRef.current = data;

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

      // SMA indicators
      const sma7Data = computeSMA(data, 7);
      const sma25Data = computeSMA(data, 25);
      sma7Series.setData(sma7Data.map((d) => ({ time: d.time as any, value: d.value })));
      sma25Series.setData(sma25Data.map((d) => ({ time: d.time as any, value: d.value })));

      // Current price line
      const lastCandle = data[data.length - 1];
      const priceColor = lastCandle.close >= lastCandle.open ? '#00ff8860' : '#ff336660';
      priceLineRef.current = candleSeries.createPriceLine({
        price: lastCandle.close,
        color: priceColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '',
      });

      // Set initial legend
      setLegendData({
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
        volume: lastCandle.volume,
        sma7: sma7Data.length > 0 ? sma7Data[sma7Data.length - 1].value : null,
        sma25: sma25Data.length > 0 ? sma25Data[sma25Data.length - 1].value : null,
      });

      chart.timeScale().fitContent();
      lastTimeRef.current = lastCandle.time;
      setLoading(false);
      setIsLive(true);
    });

    // Polling for live updates
    const pollInterval = setInterval(async () => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

      const data = await fetchData();
      if (data.length === 0) return;

      allDataRef.current = data;

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

      // Update SMA
      const sma7Data = computeSMA(data, 7);
      const sma25Data = computeSMA(data, 25);
      if (sma7SeriesRef.current) sma7SeriesRef.current.setData(sma7Data.map((d) => ({ time: d.time as any, value: d.value })));
      if (sma25SeriesRef.current) sma25SeriesRef.current.setData(sma25Data.map((d) => ({ time: d.time as any, value: d.value })));

      // Update price line
      if (data.length > 0) {
        const last = data[data.length - 1];
        lastTimeRef.current = last.time;

        if (priceLineRef.current && candleSeriesRef.current) {
          candleSeriesRef.current.removePriceLine(priceLineRef.current);
        }
        const priceColor = last.close >= last.open ? '#00ff8860' : '#ff336660';
        priceLineRef.current = candleSeriesRef.current.createPriceLine({
          price: last.close,
          color: priceColor,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: '',
        });
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
      sma7SeriesRef.current = null;
      sma25SeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mint, timeframe, fetchData]);

  return (
    <div
      ref={wrapperRef}
      className={`p-4 ${isFullscreen ? 'bg-background' : ''}`}
    >
      {/* Toolbar row */}
      <div className="flex items-center gap-1 mb-3">
        {/* Timeframe selector */}
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

        {/* Divider */}
        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Chart tools */}
        <ChartToolbar
          showVolume={showVolume}
          onToggleVolume={() => setShowVolume((p) => !p)}
          showSMA={showSMA}
          onToggleSMA={() => setShowSMA((p) => !p)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onScreenshot={handleScreenshot}
        />

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
        {/* OHLCV Legend */}
        <ChartLegend data={legendData} showSMA={showSMA} />

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
        <div
          ref={chartRef}
          className={`transition-opacity duration-200 ${loading ? 'opacity-40' : 'opacity-100'}`}
          style={{ width: '100%', height: chartHeight }}
        />
      </div>
    </div>
  );
}
