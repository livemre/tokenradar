'use client';

import { formatChartPrice, formatChartVolume, computePriceChange } from '@/lib/utils/chart-helpers';

export interface LegendData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma7: number | null;
  sma25: number | null;
}

interface ChartLegendProps {
  data: LegendData | null;
  showSMA: boolean;
}

export function ChartLegend({ data, showSMA }: ChartLegendProps) {
  if (!data) return null;

  const change = computePriceChange(data.open, data.close);
  const changeColor = change.direction === 'up' ? '#00ff88' : change.direction === 'down' ? '#ff3366' : '#666';
  const changeSign = change.direction === 'up' ? '+' : '';

  return (
    <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 pointer-events-none">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-mono">
        <span className="text-muted">
          O <span className="text-foreground">{formatChartPrice(data.open)}</span>
        </span>
        <span className="text-muted">
          H <span className="text-foreground">{formatChartPrice(data.high)}</span>
        </span>
        <span className="text-muted">
          L <span className="text-foreground">{formatChartPrice(data.low)}</span>
        </span>
        <span className="text-muted">
          C <span className="text-foreground">{formatChartPrice(data.close)}</span>
        </span>
        <span style={{ color: changeColor }}>
          {changeSign}{change.percent.toFixed(2)}%
        </span>
        <span className="text-muted">
          Vol <span className="text-foreground">{formatChartVolume(data.volume)}</span>
        </span>
      </div>
      {showSMA && (data.sma7 !== null || data.sma25 !== null) && (
        <div className="flex items-center gap-x-2.5 text-[10px] font-mono mt-0.5">
          {data.sma7 !== null && (
            <span style={{ color: '#2962FF' }}>
              SMA7 {formatChartPrice(data.sma7)}
            </span>
          )}
          {data.sma25 !== null && (
            <span style={{ color: '#FF6D00' }}>
              SMA25 {formatChartPrice(data.sma25)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
