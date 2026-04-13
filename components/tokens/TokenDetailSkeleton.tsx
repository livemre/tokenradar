import { Skeleton } from '@/components/ui/Skeleton';

export function TokenDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-7" />
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
            <Skeleton className="w-48 h-4" />
          </div>
          <div className="hidden sm:block space-y-2 text-right">
            <Skeleton className="w-24 h-7" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Tab bar skeleton */}
      <Skeleton className="w-80 h-10 rounded-xl" />

      {/* Chart area skeleton */}
      <Skeleton className="w-full h-[350px] rounded-xl" />
    </div>
  );
}
