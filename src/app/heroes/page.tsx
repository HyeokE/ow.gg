import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getHeroFiltersKey,
  parseHeroFilters,
  type HeroesSearchParams,
} from "@/components/ow/heroes/filters";
import { HeroesDataSection } from "@/components/ow/heroes/heroes-list";
import { HeroesListSkeleton } from "@/components/ow/heroes/heroes-list-skeleton";

export const metadata: Metadata = {
  title: "영웅 | OW.GG",
  description: "OverFast 영웅 목록과 역할, 게임 모드별 필터",
};

export const revalidate = 3600;

type HeroesPageProps = {
  searchParams: Promise<HeroesSearchParams>;
};

export default async function HeroesPage({ searchParams }: HeroesPageProps) {
  const filters = parseHeroFilters(await searchParams);

  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={<HeroesListSkeleton />}
        key={getHeroFiltersKey(filters)}
      >
        <HeroesDataSection filters={filters} />
      </Suspense>
    </main>
  );
}
