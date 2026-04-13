/** Format price for chart Y-axis — handles very small memecoin prices */
export function formatChartPrice(price: number): string {
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  if (price >= 0.0000001) return price.toFixed(10);
  return price.toExponential(4);
}

/** Format volume for legend display (e.g., "1.23M", "456K") */
export function formatChartVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(2)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  if (volume >= 1) return volume.toFixed(1);
  return volume.toFixed(4);
}

/** Compute price change from open to close */
export function computePriceChange(open: number, close: number): {
  absolute: number;
  percent: number;
  direction: 'up' | 'down' | 'flat';
} {
  const absolute = close - open;
  const percent = open !== 0 ? (absolute / open) * 100 : 0;
  const direction = absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'flat';
  return { absolute, percent, direction };
}
