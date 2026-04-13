import { Skeleton } from '@/components/ui/Skeleton';

export function TokenCardSkeleton() {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-10 h-10" variant="circle" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-14 h-4 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-3" />
              <Skeleton className="w-10 h-3" />
              <Skeleton className="w-14 h-3" />
            </div>
          </div>
        </div>
        <div className="hidden sm:block text-right space-y-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-16 h-6 rounded-lg" />
          <Skeleton className="sm:hidden w-14 h-4" />
        </div>
      </div>
    </div>
  );
}
