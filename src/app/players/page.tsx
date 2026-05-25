import type { Metadata } from "next";
import { Suspense } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerSearchResults } from "@/components/ow/players/player-search-results";
import { PlayerSearchResultsSkeleton } from "@/components/ow/players/player-skeletons";
import { readSearchParam } from "@/components/ow/players/player-format";

export const metadata: Metadata = {
  title: "플레이어 검색 | OW.GG",
  description: "OverFast 기반 오버워치 플레이어 검색",
};

export const revalidate = 600;

type PlayersSearchParams = Record<string, string | string[] | undefined>;

type PlayersPageProps = {
  searchParams: Promise<PlayersSearchParams>;
};

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const query = readSearchParam(await searchParams, "q", "name");

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-brand-orange">Players</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              플레이어 검색
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              BattleTag 또는 닉네임으로 공개 프로필과 누적 통계를 찾습니다.
            </p>
          </div>

          <form
            action="/players"
            className="grid gap-2 rounded-lg border bg-background p-3 sm:grid-cols-[1fr_auto]"
          >
            <Input
              aria-label="플레이어 검색어"
              className="h-10"
              defaultValue={query}
              name="q"
              placeholder="TeKrop#2217 또는 TeKrop"
            />
            <Button type="submit" size="lg">
              <Search className="size-4" />
              검색
            </Button>
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<PlayerSearchResultsSkeleton />} key={query}>
          <PlayerSearchResults query={query} />
        </Suspense>
      </section>
    </main>
  );
}
