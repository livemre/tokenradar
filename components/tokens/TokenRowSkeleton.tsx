import { Skeleton } from '@/components/ui/Skeleton';

export function TokenRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-border/50">
      <Skeleton className="w-7 h-7" variant="circle" />
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-12 h-4" />
      <Skeleton className="w-14 h-4 ml-auto" />
      <Skeleton className="w-14 h-4" />
      <Skeleton className="w-10 h-4" />
      <Skeleton className="w-10 h-4" />
      <Skeleton className="w-14 h-5 rounded-lg" />
      <Skeleton className="w-10 h-3" />
    </div>
  );
}
