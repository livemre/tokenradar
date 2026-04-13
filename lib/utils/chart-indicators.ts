/** Compute Simple Moving Average from OHLCV close prices */
export function computeSMA(
  data: { time: number; close: number }[],
  period: number
): { time: number; value: number }[] {
  const result: { time: number; value: number }[] = [];
  if (data.length < period) return result;

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close;
    if (i >= period) {
      sum -= data[i - period].close;
    }
    if (i >= period - 1) {
      result.push({ time: data[i].time, value: sum / period });
    }
  }

  return result;
}
