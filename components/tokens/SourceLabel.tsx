import type { TokenSource } from '@/lib/types/token';
import { getSourceLabel } from '@/lib/utils/format';
import { COLORS } from '@/lib/utils/constants';

const sourceColors: Record<TokenSource, string> = {
  pumpfun: COLORS.pumpfun,
  raydium: COLORS.raydium,
  moonshot: COLORS.moonshot,
};

export function SourceLabel({ source }: { source: TokenSource }) {
  const color = sourceColors[source];
  const label = getSourceLabel(source);

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}15`,
        color,
        border: `1px solid ${color}25`,
      }}
    >
      {label}
    </span>
  );
}
