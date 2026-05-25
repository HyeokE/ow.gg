import { Skeleton } from "@/components/ui/skeleton";

export function HeroesListSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-background/95">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(220px,1fr)_160px_160px_auto_auto]">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              className="overflow-hidden rounded-lg bg-card ring-1 ring-border"
              key={index}
            >
              <Skeleton className="aspect-[4/5] rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-12 rounded-none" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

