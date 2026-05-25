import { Skeleton } from "@/components/ui/skeleton";

export function HeroDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="mx-auto grid min-h-[520px] w-full max-w-7xl items-end gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="max-w-2xl space-y-5">
            <Skeleton className="h-5 w-24 bg-background/20" />
            <Skeleton className="h-16 w-72 bg-background/20" />
            <Skeleton className="h-24 w-full max-w-xl bg-background/20" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 bg-background/20" />
              <Skeleton className="h-6 w-24 bg-background/20" />
            </div>
          </div>
          <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[320px] rounded-lg bg-background/20" />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-28" key={index} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton className="h-36" key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

