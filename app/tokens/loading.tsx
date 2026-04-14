export default function TokensLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="h-14 border-b border-white/5 bg-background/60" />

      {/* Stats bar skeleton */}
      <div className="h-10 border-b border-white/5 bg-white/[0.02]" />

      {/* Tabs skeleton */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>

        {/* Token cards skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
              style={{ animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
