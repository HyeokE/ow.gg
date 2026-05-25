/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, Hash, Search, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { createOverfastServerApi } from "@/lib/overfast/server";
import {
  PLAYER_REVALIDATE_SECONDS,
  displayPlayerId,
  formatDateTime,
  normalizeBattleTagInput,
  playerPath,
  searchResultCountLabel,
} from "./player-format";

type PlayerSearchResultsProps = {
  query: string;
};

export async function PlayerSearchResults({ query }: PlayerSearchResultsProps) {
  const normalizedQuery = normalizeBattleTagInput(query);

  if (!normalizedQuery) {
    return <PlayerSearchEmpty />;
  }

  const api = createOverfastServerApi({
    revalidate: PLAYER_REVALIDATE_SECONDS,
  });
  const result = await api.searchPlayers({
    name: normalizedQuery,
    limit: 25,
  });

  if (result.results.length === 0) {
    return (
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle>검색 결과가 없습니다</EmptyTitle>
          <EmptyDescription>
            BattleTag를 입력했다면 #을 -로 바꾼 값도 함께 검색합니다.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <section className="space-y-3" aria-label="플레이어 검색 결과">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">검색 결과</h2>
          <p className="text-sm text-muted-foreground">
            {searchResultCountLabel(result)}
          </p>
        </div>
        {query !== normalizedQuery ? (
          <Badge variant="outline" className="gap-1">
            <Hash className="size-3" />
            {normalizedQuery}
          </Badge>
        ) : null}
      </div>

      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {result.results.map((player) => (
          <article
            key={`${player.player_id}-${player.blizzard_id}`}
            className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <PlayerAvatar
                src={player.avatar}
                name={player.name}
                className="size-12"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold">
                    {player.name}
                  </h3>
                  <PlayerPublicBadge isPublic={player.is_public} />
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {displayPlayerId(player.player_id)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(player.last_updated_at)}
                </p>
              </div>
            </div>
            <Button variant="outline" render={<Link href={playerPath(player.player_id)} />}>
              상세 보기
              <ArrowRight />
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlayerSearchEmpty() {
  return (
    <Empty className="min-h-72 border bg-card">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserRound />
        </EmptyMedia>
        <EmptyTitle>플레이어 이름 또는 BattleTag를 입력하세요</EmptyTitle>
        <EmptyDescription>
          예: TeKrop#2217 또는 TeKrop-2217. 검색 요청은 기본 OverFast 플레이어 검색으로 처리됩니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function PlayerAvatar({
  src,
  name,
  className = "size-16",
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-muted-foreground ${className}`}
        aria-hidden="true"
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} 아바타`}
      className={`shrink-0 rounded-full border bg-muted object-cover ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}

export function PlayerPublicBadge({
  isPublic,
}: {
  isPublic?: boolean | null;
}) {
  if (isPublic === true) {
    return <Badge variant="secondary">공개</Badge>;
  }

  if (isPublic === false) {
    return <Badge variant="outline">비공개</Badge>;
  }

  return <Badge variant="outline">상태 미확인</Badge>;
}
