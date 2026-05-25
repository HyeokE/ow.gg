import type { HeroGamemode, ListHeroesQuery, Role } from "@/lib/overfast";

import {
  DEFAULT_HERO_LOCALE,
  GAMEMODE_OPTIONS,
  ROLE_OPTIONS,
} from "./constants";

export type HeroesSearchParams = {
  [key: string]: string | string[] | undefined;
};

export type HeroFilters = {
  role?: Role;
  gamemode?: HeroGamemode;
  q: string;
};

const VALID_ROLES = ROLE_OPTIONS.map((option) => option.key);
const VALID_GAMEMODES = GAMEMODE_OPTIONS.map((option) => option.key);

function firstValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isRole(value: string | undefined): value is Role {
  return VALID_ROLES.includes(value as Role);
}

function isGamemode(value: string | undefined): value is HeroGamemode {
  return VALID_GAMEMODES.includes(value as HeroGamemode);
}

export function parseHeroFilters(searchParams: HeroesSearchParams): HeroFilters {
  const role = firstValue(searchParams.role);
  const gamemode = firstValue(searchParams.gamemode);
  const q = firstValue(searchParams.q) ?? "";

  return {
    role: isRole(role) ? role : undefined,
    gamemode: isGamemode(gamemode) ? gamemode : undefined,
    q: q.trim().slice(0, 80),
  };
}

export function toHeroListQuery(filters: HeroFilters): ListHeroesQuery {
  return {
    locale: DEFAULT_HERO_LOCALE,
    role: filters.role ?? null,
    gamemode: filters.gamemode ?? null,
  };
}

export function getHeroFiltersKey(filters: HeroFilters) {
  return [filters.role ?? "all", filters.gamemode ?? "all", filters.q].join(
    ":"
  );
}

export function normalizeHeroSearch(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

