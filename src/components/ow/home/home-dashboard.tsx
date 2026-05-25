import Image from "next/image";
import Link from "next/link";
import { BarChart3, MapIcon, Search, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { createOverfastServerApi } from "@/lib/overfast/server";
import type { HeroShort, Map as OverfastMap } from "@/lib/overfast";

const ROLE_LABELS: Record<string, string> = {
  tank: "탱커",
  damage: "공격",
  support: "지원",
};

export function HomeDashboardFallback() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <Skeleton className="h-80" />
      <div className="grid gap-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}

export async function HomeDashboard() {
  const api = createOverfastServerApi({ revalidate: 3600 });
  const [heroes, maps, gamemodes] = await Promise.all([
    api.listHeroes({ locale: "ko-kr" }),
    api.listMaps(),
    api.listMapGamemodes(),
  ]);

  const featuredHeroes = heroes.slice(0, 12);
  const stadiumHeroes = heroes.filter((hero) => hero.gamemodes.includes("stadium"));
  const modeCounts = countMapsByMode(maps);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="min-h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-4 text-brand-orange" />
            플레이어 검색
          </CardTitle>
          <CardDescription>
            BattleTag 또는 닉네임으로 공개 프로필과 히어로별 누적 통계를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action="/players" className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              name="q"
              placeholder="Player-1234 또는 닉네임"
              className="h-10"
              aria-label="플레이어 검색어"
            />
            <Button type="submit" size="lg">
              <Search className="size-4" />
              검색
            </Button>
          </form>
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-medium">히어로 바로가기</h2>
                <p className="text-sm text-muted-foreground">
                  {heroes.length}명의 히어로 중 일부를 표시합니다.
                </p>
              </div>
              <Button
                nativeButton={false}
                render={<Link href="/heroes" />}
                size="sm"
                variant="outline"
              >
                전체 보기
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {featuredHeroes.map((hero) => (
                <HeroTile key={hero.key} hero={hero} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4 text-brand-orange" />
              메타 통계
            </CardTitle>
            <CardDescription>
              픽률/승률 데이터는 별도 통계 화면에서 장애 상태까지 분리해 제공합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button nativeButton={false} render={<Link href="/stats/heroes" />}>
              <BarChart3 className="size-4" />
              히어로 통계 보기
            </Button>
            <Badge variant="secondary">PC/콘솔</Badge>
            <Badge variant="secondary">지역/티어 필터</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapIcon className="size-4 text-brand-orange" />
              맵과 모드
            </CardTitle>
            <CardDescription>
              {maps.length}개 맵과 {gamemodes.length}개 게임 모드를 탐색합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {gamemodes.slice(0, 6).map((mode) => (
                <Link
                  key={mode.key}
                  href={`/maps?gamemode=${mode.key}`}
                  className="rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                >
                  <div className="font-medium">{mode.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {modeCounts.get(mode.key) ?? 0}개 맵
                  </div>
                </Link>
              ))}
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/maps" />}
              size="sm"
              variant="outline"
            >
              전체 맵 보기
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-4 text-brand-orange" />
              스타디움 지원
            </CardTitle>
            <CardDescription>
              현재 {stadiumHeroes.length}명의 히어로가 스타디움 데이터를 제공합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function HeroTile({ hero }: { hero: HeroShort }) {
  return (
    <Link
      href={`/heroes/${hero.key}`}
      className="group grid gap-2 rounded-lg border bg-background p-2 transition-colors hover:bg-muted"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image
          src={hero.portrait}
          alt={hero.name}
          fill
          sizes="120px"
          className="object-contain transition-transform group-hover:scale-105"
        />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium">{hero.name}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          {ROLE_LABELS[hero.role] ?? hero.role}
        </div>
      </div>
    </Link>
  );
}

function countMapsByMode(maps: OverfastMap[]) {
  const counts = new Map<string, number>();

  for (const map of maps) {
    for (const mode of map.gamemodes) {
      counts.set(mode, (counts.get(mode) ?? 0) + 1);
    }
  }

  return counts;
}
