import { Suspense } from "react";

import { HomeDashboard, HomeDashboardFallback } from "@/components/ow/home/home-dashboard";

export const revalidate = 3600;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="grid gap-4">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            Overwatch data hub
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            히어로와 플레이어 전적을 한 번에 탐색합니다.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            현재 보유한 OverFast 데이터로 히어로 도감, 플레이어 누적 통계, 맵/모드 탐색,
            히어로 메타 통계 화면을 구성합니다.
          </p>
        </div>
      </section>
      <Suspense fallback={<HomeDashboardFallback />}>
        <HomeDashboard />
      </Suspense>
    </main>
  );
}
