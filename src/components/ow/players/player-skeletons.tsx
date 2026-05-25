import { Skeleton } from "@/components/ui/skeleton";

export function PlayerSearchResultsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Skeleton className="h-36 w-full rounded-none" />
        <div className="-mt-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-end">
          <Skeleton className="size-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export function PlayerHeroDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
        <Skeleton className="size-20 rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
