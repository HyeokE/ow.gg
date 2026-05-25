import { AlertCircleIcon, SearchXIcon } from "lucide-react";

import { createOverfastServerApi } from "@/lib/overfast/server";
import type { HeroShort, ListRolesData } from "@/lib/overfast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { DEFAULT_HERO_LOCALE, ROLE_OPTIONS } from "./constants";
import { HeroCard } from "./hero-card";
import { HeroesFilterForm, type RoleFilterOption } from "./heroes-filter-form";
import {
  normalizeHeroSearch,
  toHeroListQuery,
  type HeroFilters,
} from "./filters";

type HeroesData = {
  error?: string;
  heroes: HeroShort[];
  roleOptions: RoleFilterOption[];
  totalCount: number;
};

function mapRoleOptions(roles: ListRolesData): RoleFilterOption[] {
  const labelByKey = new Map(roles.map((role) => [role.key, role.name]));

  return ROLE_OPTIONS.map((role) => ({
    key: role.key,
    label: labelByKey.get(role.key) ?? role.label,
  }));
}

function matchesSearch(hero: HeroShort, query: string) {
  if (!query) {
    return true;
  }

  const searchable = [
    hero.name,
    hero.key,
    hero.role,
    hero.subrole,
    ...hero.gamemodes,
  ]
    .join(" ")
    .toLocaleLowerCase("ko-KR");

  return searchable.includes(query);
}

async function getHeroesData(filters: HeroFilters): Promise<HeroesData> {
  const fallbackRoles = ROLE_OPTIONS.map((role) => ({
    key: role.key,
    label: role.label,
  })) satisfies RoleFilterOption[];

  try {
    const api = await createOverfastServerApi();
    const [heroesResult, rolesResult] = await Promise.allSettled([
      api.listHeroes(toHeroListQuery(filters)),
      api.listRoles({ locale: DEFAULT_HERO_LOCALE }),
    ]);

    const roleOptions =
      rolesResult.status === "fulfilled"
        ? mapRoleOptions(rolesResult.value)
        : fallbackRoles;

    if (heroesResult.status === "rejected") {
      return {
        error: "영웅 목록을 불러오지 못했습니다. 잠시 후 다시 시도하세요.",
        heroes: [],
        roleOptions,
        totalCount: 0,
      };
    }

    const query = normalizeHeroSearch(filters.q);
    const heroes = heroesResult.value.filter((hero) =>
      matchesSearch(hero, query)
    );

    return {
      heroes,
      roleOptions,
      totalCount: heroesResult.value.length,
    };
  } catch {
    return {
      error: "OverFast 서버 API 클라이언트를 준비하지 못했습니다.",
      heroes: [],
      roleOptions: fallbackRoles,
      totalCount: 0,
    };
  }
}

export async function HeroesDataSection({
  filters,
}: {
  filters: HeroFilters;
}) {
  const data = await getHeroesData(filters);

  return (
    <>
      <HeroesFilterForm
        filters={filters}
        resultCount={data.heroes.length}
        roleOptions={data.roleOptions}
        totalCount={data.totalCount}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {data.error ? (
          <Alert className="border-destructive/30" variant="destructive">
            <AlertCircleIcon aria-hidden="true" />
            <AlertTitle>목록 데이터 오류</AlertTitle>
            <AlertDescription>{data.error}</AlertDescription>
          </Alert>
        ) : data.heroes.length === 0 ? (
          <Empty className="min-h-72 border border-dashed">
            <EmptyMedia variant="icon">
              <SearchXIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>조건에 맞는 영웅이 없습니다.</EmptyTitle>
              <EmptyDescription>
                검색어를 줄이거나 역할과 게임 모드 필터를 초기화하세요.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.heroes.map((hero) => (
              <HeroCard hero={hero} key={hero.key} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
