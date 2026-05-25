import type { Metadata } from "next";
import { Suspense } from "react";

import { PlayerDetail } from "@/components/ow/players/player-detail";
import { PlayerDetailSkeleton } from "@/components/ow/players/player-skeletons";
import {
  displayPlayerId,
  normalizeRoutePlayerId,
} from "@/components/ow/players/player-format";

export const revalidate = 600;

type PlayerPageProps = {
  params: Promise<{
    playerId: string;
  }>;
};

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const normalizedPlayerId = normalizeRoutePlayerId(playerId);

  return {
    title: `${displayPlayerId(normalizedPlayerId)} | 플레이어 | OW.GG`,
    description: `${displayPlayerId(normalizedPlayerId)} 플레이어 통계`,
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const normalizedPlayerId = normalizeRoutePlayerId(playerId);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={<PlayerDetailSkeleton />}
          key={normalizedPlayerId}
        >
          <PlayerDetail playerId={normalizedPlayerId} />
        </Suspense>
      </section>
    </main>
  );
}
