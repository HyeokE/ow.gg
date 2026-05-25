import type {
  HeroKey,
  HeroShort,
  PlayerCompetitiveRank,
  PlayerCompetitiveRanksContainer,
  PlayerSearchResult,
  PlayerStatsSummary,
  StatsSummary,
} from "@/lib/overfast";

export const DEFAULT_OVERFAST_LOCALE = "ko-kr" as const;
export const PLAYER_REVALIDATE_SECONDS = 600;

export const HERO_KEYS = [
  "ana",
  "anran",
  "ashe",
  "baptiste",
  "bastion",
  "brigitte",
  "cassidy",
  "dva",
  "domina",
  "doomfist",
  "echo",
  "emre",
  "freja",
  "genji",
  "hazard",
  "hanzo",
  "illari",
  "jetpack-cat",
  "junker-queen",
  "junkrat",
  "juno",
  "kiriko",
  "lifeweaver",
  "lucio",
  "mauga",
  "mei",
  "mercy",
  "mizuki",
  "moira",
  "orisa",
  "pharah",
  "ramattra",
  "reaper",
  "reinhardt",
  "roadhog",
  "sigma",
  "sierra",
  "sojourn",
  "soldier-76",
  "sombra",
  "symmetra",
  "torbjorn",
  "tracer",
  "vendetta",
  "venture",
  "widowmaker",
  "winston",
  "wrecking-ball",
  "wuyang",
  "zarya",
  "zenyatta",
] as const satisfies readonly HeroKey[];

export const ROLE_LABELS = {
  tank: "돌격",
  damage: "공격",
  support: "지원",
  open: "자유",
} as const;

export const PLATFORM_LABELS = {
  pc: "PC",
  console: "콘솔",
} as const;

export const GAMEMODE_LABELS = {
  competitive: "경쟁전",
  quickplay: "빠른 대전",
} as const;

export type RoleKey = keyof typeof ROLE_LABELS;
export type PlatformKey = keyof typeof PLATFORM_LABELS;

export type StatRow = {
  key: string;
  label: string;
  summary: StatsSummary;
  href?: string;
  meta?: string;
};

export function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = params[key];

    if (Array.isArray(value)) {
      const firstValue = value.find(Boolean);

      if (firstValue) {
        return firstValue;
      }

      continue;
    }

    if (value) {
      return value;
    }
  }

  return "";
}

export function normalizeBattleTagInput(value: string) {
  return value.trim().replace(/#/g, "-");
}

export function normalizeRoutePlayerId(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function displayPlayerId(playerId: string) {
  return playerId.replace(/-(\d+)$/, "#$1");
}

export function playerPath(playerId: string) {
  return `/players/${encodePathSegment(playerId)}`;
}

export function heroPath(playerId: string, heroKey: HeroKey) {
  return `${playerPath(playerId)}/heroes/${heroKey}`;
}

export function isHeroKey(value: string): value is HeroKey {
  return (HERO_KEYS as readonly string[]).includes(value);
}

export function heroNameMap(heroes: HeroShort[]) {
  return new Map(heroes.map((hero) => [hero.key, hero.name]));
}

export function heroRoleMap(heroes: HeroShort[]) {
  return new Map(heroes.map((hero) => [hero.key, ROLE_LABELS[hero.role]]));
}

export function getHeroName(
  heroKey: HeroKey | "all-heroes",
  names: Map<HeroKey, string>
) {
  if (heroKey === "all-heroes") {
    return "전체 영웅";
  }

  return names.get(heroKey) ?? titleizeHeroKey(heroKey);
}

export function getOverallRows(stats: PlayerStatsSummary | null | undefined) {
  if (!stats?.general) {
    return [];
  }

  return [
    {
      key: "general",
      label: "전체",
      summary: stats.general,
    },
  ] satisfies StatRow[];
}

export function getRoleRows(stats: PlayerStatsSummary | null | undefined) {
  const roles = stats?.roles;

  if (!roles) {
    return [];
  }

  return (["tank", "damage", "support"] as const).flatMap((role) => {
    const summary = roles[role];

    if (!summary) {
      return [];
    }

    const row = {
      key: role,
      label: ROLE_LABELS[role],
      summary,
    } satisfies StatRow;

    return [row];
  });
}

export function getHeroRows(
  stats: PlayerStatsSummary | null | undefined,
  heroes: HeroShort[],
  playerId: string
) {
  const heroStats = stats?.heroes;

  if (!heroStats) {
    return [];
  }

  const names = heroNameMap(heroes);
  const roles = heroRoleMap(heroes);

  return Object.entries(heroStats)
    .flatMap(([key, summary]) => {
      if (!summary || !isHeroKey(key)) {
        return [];
      }

      const row = {
        key,
        label: getHeroName(key, names),
        summary,
        href: heroPath(playerId, key),
        meta: roles.get(key),
      } satisfies StatRow;

      return [row];
    })
    .sort((a, b) => b.summary.time_played - a.summary.time_played);
}

export function competitiveRankRows(
  competitive: PlayerCompetitiveRanksContainer | null | undefined
) {
  if (!competitive) {
    return [];
  }

  return (["pc", "console"] as const).flatMap((platform) => {
    const ranks = competitive[platform];

    if (!ranks) {
      return [];
    }

    return (["tank", "damage", "support", "open"] as const).map((role) => ({
      key: `${platform}-${role}`,
      platform,
      role,
      season: ranks.season,
      rank: ranks[role],
    }));
  });
}

export function formatRank(rank: PlayerCompetitiveRank | null) {
  if (!rank) {
    return "기록 없음";
  }

  return `${translateDivision(rank.division)} ${rank.tier}`;
}

export function translateDivision(division: PlayerCompetitiveRank["division"]) {
  const labels = {
    bronze: "브론즈",
    silver: "실버",
    gold: "골드",
    platinum: "플래티넘",
    diamond: "다이아몬드",
    master: "마스터",
    grandmaster: "그랜드마스터",
    ultimate: "얼티밋",
  } satisfies Record<PlayerCompetitiveRank["division"], string>;

  return labels[division];
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits,
  }).format(value);
}

export function formatDecimal(value: number) {
  return formatNumber(value, 2);
}

export function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0분";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours >= 1) {
    return minutes > 0 ? `${formatNumber(hours)}시간 ${minutes}분` : `${formatNumber(hours)}시간`;
  }

  return `${Math.max(1, minutes)}분`;
}

export function formatDateTime(timestamp: number | null | undefined) {
  if (!timestamp) {
    return "업데이트 정보 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));
}

export function searchResultCountLabel(result: PlayerSearchResult) {
  return `${formatNumber(result.total)}명 중 ${formatNumber(result.results.length)}명 표시`;
}

function encodePathSegment(segment: string) {
  return segment
    .split(/(%7C)/i)
    .map((part) => (part.toLowerCase() === "%7c" ? "%7C" : encodeURIComponent(part)))
    .join("");
}

function titleizeHeroKey(heroKey: HeroKey) {
  return heroKey
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
