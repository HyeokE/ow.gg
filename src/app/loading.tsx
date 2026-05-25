import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6">
      <Skeleton className="h-24" />
      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Skeleton className="h-80" />
        <div className="grid gap-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    </main>
  );
}

