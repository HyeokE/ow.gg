import { Skeleton } from "@/components/ui/skeleton";
import { PlayerSearchResultsSkeleton } from "@/components/ow/players/player-skeletons";

export default function PlayersLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PlayerSearchResultsSkeleton />
      </section>
    </main>
  );
}
