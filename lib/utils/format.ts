export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.0001) return num.toFixed(4);
  if (num >= 0.0000001) return num.toFixed(8);
  // For extremely small numbers, show subscript-style: 0.0₅1234
  const str = num.toFixed(20);
  const match = str.match(/^0\.(0+)(\d{1,4})/);
  if (match) {
    const zeroCount = match[1].length;
    const significant = match[2];
    return `0.0\u2080${subscriptDigit(zeroCount)}${significant}`;
  }
  return num.toFixed(10);
}

function subscriptDigit(n: number): string {
  const subscripts = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';
  return String(n).split('').map(d => subscripts[parseInt(d)]).join('');
}

export function formatUSD(num: number | null): string {
  if (num === null) return '-';
  return `$${formatNumber(num)}`;
}

export function formatPercent(num: number | null): string {
  if (num === null) return '-';
  return `${num.toFixed(1)}%`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getSourceLabel(source: string): string {
  switch (source) {
    case 'pumpfun': return 'Pump.fun';
    case 'raydium': return 'Raydium';
    case 'moonshot': return 'Moonshot';
    default: return source;
  }
}

export function formatLocalTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatLocalDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatLiveAge(detectedAt: string): string {
  const seconds = Math.floor((Date.now() - new Date(detectedAt).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  return `${Math.floor(seconds / 86400)}d`;
}
