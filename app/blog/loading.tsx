export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="h-14 border-b border-white/5 bg-background/60" />

      {/* Hero skeleton */}
      <div className="py-16 px-4 text-center">
        <div className="h-10 w-64 mx-auto rounded bg-white/5 animate-pulse mb-4" />
        <div className="h-5 w-96 mx-auto rounded bg-white/5 animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="h-40 bg-white/[0.03]" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded bg-white/5" />
                <div className="h-4 w-full rounded bg-white/5" />
                <div className="h-3 w-1/3 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
