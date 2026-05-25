import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getHeroStatsFiltersKey,
  HeroStatsDataSection,
  HeroStatsFiltersBar,
  HeroStatsSectionSkeleton,
  normalizeHeroStatsFilters,
  type HeroStatsSearchParams,
} from "@/components/ow/stats/hero-stats";

export const metadata: Metadata = {
  title: "영웅 통계 | OW.GG",
  description: "OverFast 기반 오버워치 영웅 픽률과 승률 통계",
};

export const revalidate = 3600;

export default async function HeroesStatsPage({
  searchParams,
}: {
  searchParams: Promise<HeroStatsSearchParams>;
}) {
  const filters = normalizeHeroStatsFilters(await searchParams);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-sm font-medium text-brand-orange">Stats</div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          영웅 통계
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          플랫폼, 게임 모드, 지역, 역할, 티어 조건으로 OverFast 영웅
          픽률과 승률을 비교합니다.
        </p>
      </section>

      <HeroStatsFiltersBar filters={filters} />

      <Suspense
        key={getHeroStatsFiltersKey(filters)}
        fallback={<HeroStatsSectionSkeleton />}
      >
        <HeroStatsDataSection filters={filters} />
      </Suspense>
    </main>
  );
}
