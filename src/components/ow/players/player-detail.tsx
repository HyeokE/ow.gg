/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Shield, Swords, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { OverfastApiError, type HeroShort, type PlayerSummary } from "@/lib/overfast";
import { createOverfastServerApi } from "@/lib/overfast/server";
import { PlayerAvatar } from "./player-search-results";
import {
  DEFAULT_OVERFAST_LOCALE,
  GAMEMODE_LABELS,
  PLATFORM_LABELS,
  ROLE_LABELS,
  StatRow,
  competitiveRankRows,
  displayPlayerId,
  formatDateTime,
  formatDecimal,
  formatNumber,
  formatPercent,
  formatRank,
  formatTime,
  getHeroRows,
  getOverallRows,
  getRoleRows,
} from "./player-format";

type PlayerDetailProps = {
  playerId: string;
};

export async function PlayerDetail({ playerId }: PlayerDetailProps) {
  const api = await createOverfastServerApi();

  const [summary, stats, heroes] = await Promise.all([
    api.getPlayerSummary(playerId).catch((error: unknown) => {
      if (error instanceof OverfastApiError && error.status === 404) {
        notFound();
      }

      throw error;
    }),
    api.getPlayerStatsSummary(playerId).catch((error: unknown) => {
      if (error instanceof OverfastApiError && [404, 422].includes(error.status)) {
        return null;
      }

      throw error;
    }),
    api.listHeroes({ locale: DEFAULT_OVERFAST_LOCALE }).catch(() => []),
  ]);

  const overallRows = getOverallRows(stats);
  const roleRows = getRoleRows(stats);
  const heroRows = getHeroRows(stats, heroes, playerId);

  return (
    <div className="space-y-6">
      <PlayerProfileHeader playerId={playerId} summary={summary} />
      <CompetitiveRanks summary={summary} />
      <StatsTable
        title="전체 통계"
        description={`${GAMEMODE_LABELS.quickplay}과 ${GAMEMODE_LABELS.competitive}, 모든 플랫폼을 합산한 요약입니다.`}
        rows={overallRows}
        emptyTitle="전체 통계가 없습니다"
      />
      <StatsTable
        title="역할별 통계"
        description="돌격, 공격, 지원 역할별 누적 플레이 요약입니다."
        rows={roleRows}
        emptyTitle="역할별 통계가 없습니다"
      />
      <StatsTable
        title="히어로별 통계"
        description="플레이 시간이 많은 히어로부터 정렬했습니다."
        rows={heroRows}
        emptyTitle="히어로별 통계가 없습니다"
      />
    </div>
  );
}

function PlayerProfileHeader({
  playerId,
  summary,
}: {
  playerId: string;
  summary: PlayerSummary;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card" aria-label="플레이어 프로필">
      <div className="relative h-36 bg-muted sm:h-44">
        {summary.namecard ? (
          <img
            src={summary.namecard}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(120deg,var(--muted),var(--accent))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>
      <div className="-mt-12 flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
          <PlayerAvatar
            src={summary.avatar}
            name={summary.username}
            className="size-24 ring-4 ring-background"
          />
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-3xl font-semibold tracking-tight">
                {summary.username}
              </h1>
              {summary.endorsement ? (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="size-3" />
                  추천 {summary.endorsement.level}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {summary.title ?? displayPlayerId(playerId)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              마지막 업데이트: {formatDateTime(summary.last_updated_at)}
            </p>
          </div>
        </div>
        <Button variant="outline" render={<Link href="/players" />}>
          다른 플레이어 검색
        </Button>
      </div>
    </section>
  );
}

function CompetitiveRanks({ summary }: { summary: PlayerSummary }) {
  const rows = competitiveRankRows(summary.competitive);
  const availableRows = rows.filter((row) => row.rank);

  return (
    <section className="rounded-xl border bg-card p-5" aria-label="경쟁전 티어">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">경쟁전 티어</h2>
          <p className="text-sm text-muted-foreground">
            플랫폼별 마지막 경쟁전 시즌의 역할 랭크입니다.
          </p>
        </div>
        <Badge variant={availableRows.length > 0 ? "secondary" : "outline"}>
          {availableRows.length > 0 ? `${availableRows.length}개 역할` : "기록 없음"}
        </Badge>
      </div>

      {availableRows.length === 0 ? (
        <Empty className="mt-4 min-h-32 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trophy />
            </EmptyMedia>
            <EmptyTitle>공개된 경쟁전 티어가 없습니다</EmptyTitle>
            <EmptyDescription>
              프로필이 비공개이거나 해당 시즌 경쟁전 기록이 없을 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {availableRows.map((row) => (
            <div key={row.key} className="rounded-lg border bg-background p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <Badge variant="outline">{PLATFORM_LABELS[row.platform]}</Badge>
                <span className="text-xs text-muted-foreground">
                  시즌 {row.season ?? "-"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {row.rank?.rank_icon ? (
                  <img
                    src={row.rank.rank_icon}
                    alt=""
                    className="size-12 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <div>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_LABELS[row.role]}
                  </p>
                  <p className="font-semibold">{formatRank(row.rank)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function StatsTable({
  title,
  description,
  rows,
  emptyTitle,
  withLinks = false,
}: {
  title: string;
  description: string;
  rows: StatRow[];
  emptyTitle: string;
  withLinks?: boolean;
}) {
  return (
    <section className="rounded-xl border bg-card p-5" aria-label={title}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">{formatNumber(rows.length)}행</Badge>
      </div>

      {rows.length === 0 ? (
        <Empty className="mt-4 min-h-36 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Shield />
            </EmptyMedia>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>
              프로필이 비공개이거나 OverFast가 아직 해당 통계를 수집하지 못했습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[860px] caption-bottom text-sm">
            <thead className="bg-muted/60">
              <tr className="border-b">
                <TableHead>구분</TableHead>
                <TableHead>플레이 시간</TableHead>
                <TableHead>전적</TableHead>
                <TableHead>승률</TableHead>
                <TableHead>KDA</TableHead>
                <TableHead>처치</TableHead>
                <TableHead>도움</TableHead>
                <TableHead>죽음</TableHead>
                <TableHead>피해</TableHead>
                <TableHead>치유</TableHead>
                {withLinks ? <TableHead>상세</TableHead> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b last:border-0 hover:bg-muted/40">
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium">{row.label}</span>
                      {row.meta ? (
                        <span className="text-xs text-muted-foreground">{row.meta}</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{formatTime(row.summary.time_played)}</TableCell>
                  <TableCell>
                    {formatNumber(row.summary.games_won)}승{" "}
                    {formatNumber(row.summary.games_lost)}패
                  </TableCell>
                  <TableCell>{formatPercent(row.summary.winrate)}</TableCell>
                  <TableCell>{formatDecimal(row.summary.kda)}</TableCell>
                  <TableCell>{formatNumber(row.summary.total.eliminations)}</TableCell>
                  <TableCell>{formatNumber(row.summary.total.assists)}</TableCell>
                  <TableCell>{formatNumber(row.summary.total.deaths)}</TableCell>
                  <TableCell>{formatNumber(row.summary.total.damage)}</TableCell>
                  <TableCell>{formatNumber(row.summary.total.healing)}</TableCell>
                  {withLinks ? (
                    <TableCell>
                      {row.href ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          render={<Link href={row.href} />}
                        >
                          보기
                          <ArrowRight />
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function HeroIdentity({
  hero,
  fallbackName,
}: {
  hero?: HeroShort;
  fallbackName: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {hero?.portrait ? (
        <img
          src={hero.portrait}
          alt=""
          className="size-14 rounded-lg border bg-muted object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex size-14 items-center justify-center rounded-lg border bg-muted">
          <Swords className="size-5 text-muted-foreground" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {hero?.name ?? fallbackName}
        </h1>
        <div className="mt-1 flex items-center gap-2">
          {hero ? <Badge variant="secondary">{ROLE_LABELS[hero.role]}</Badge> : null}
          <span className="text-sm text-muted-foreground">히어로 상세 통계</span>
        </div>
      </div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="h-10 px-3 text-left align-middle font-medium whitespace-nowrap text-foreground">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-middle whitespace-nowrap">{children}</td>;
}

export function SectionSeparator() {
  return <Separator className="my-2" />;
}
