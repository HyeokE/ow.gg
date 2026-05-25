import { PlayerDetailSkeleton } from "@/components/ow/players/player-skeletons";

export default function PlayerLoading() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PlayerDetailSkeleton />
      </section>
    </main>
  );
}
