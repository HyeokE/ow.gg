import Link from "next/link";
import {
  AlertCircle,
  ArrowDownAZ,
  ArrowDownWideNarrow,
  Clock3,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createOverfastServerApi } from "@/lib/overfast/server";
import { OverfastApiError } from "@/lib/overfast";
import type {
  CompetitiveDivisionFilter,
  GetHeroStatsQuery,
  HeroShort,
  HeroStatsSummary,
  PlayerGamemode,
  PlayerPlatform,
  PlayerRegion,
  Role,
} from "@/lib/overfast";
import { cn } from "@/lib/utils";

type SearchParamValue = string | string[] | undefined;

export type HeroStatsSearchParams = Record<string, SearchParamValue>;

type HeroStatsOrder =
  | "hero:asc"
  | "hero:desc"
  | "pickrate:asc"
  | "pickrate:desc"
  | "winrate:asc"
  | "winrate:desc";

export type HeroStatsFilters = {
  platform: PlayerPlatform;
  gamemode: PlayerGamemode;
  region: PlayerRegion;
  role?: Role;
  division?: CompetitiveDivisionFilter;
  order: HeroStatsOrder;
};

type FilterOption<Value extends string> = {
  value?: Value;
  label: string;
};

const DEFAULT_FILTERS: HeroStatsFilters = {
  platform: "pc",
  gamemode: "competitive",
  region: "asia",
  order: "pickrate:desc",
};

const PLATFORM_OPTIONS: FilterOption<PlayerPlatform>[] = [
  { value: "pc", label: "PC" },
  { value: "console", label: "콘솔" },
];

const GAMEMODE_OPTIONS: FilterOption<PlayerGamemode>[] = [
  { value: "competitive", label: "경쟁전" },
  { value: "quickplay", label: "빠른 대전" },
];

const REGION_OPTIONS: FilterOption<PlayerRegion>[] = [
  { value: "asia", label: "아시아" },
  { value: "americas", label: "아메리카" },
  { value: "europe", label: "유럽" },
];

const ROLE_OPTIONS: FilterOption<Role>[] = [
  { label: "전체" },
  { value: "tank", label: "돌격" },
  { value: "damage", label: "공격" },
  { value: "support", label: "지원" },
];

const DIVISION_OPTIONS: FilterOption<CompetitiveDivisionFilter>[] = [
  { label: "전체" },
  { value: "bronze", label: "브론즈" },
  { value: "silver", label: "실버" },
  { value: "gold", label: "골드" },
  { value: "platinum", label: "플래티넘" },
  { value: "diamond", label: "다이아몬드" },
  { value: "master", label: "마스터" },
  { value: "grandmaster", label: "그랜드마스터+" },
];

const ORDER_OPTIONS: FilterOption<HeroStatsOrder>[] = [
  { value: "pickrate:desc", label: "픽률 높은순" },
  { value: "pickrate:asc", label: "픽률 낮은순" },
  { value: "winrate:desc", label: "승률 높은순" },
  { value: "winrate:asc", label: "승률 낮은순" },
  { value: "hero:asc", label: "영웅 이름순" },
  { value: "hero:desc", label: "영웅 이름 역순" },
];

const percentFormatter = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 1,
});

export function normalizeHeroStatsFilters(
  searchParams: HeroStatsSearchParams
): HeroStatsFilters {
  const gamemode = pickOption(
    firstValue(searchParams.gamemode),
    GAMEMODE_OPTIONS,
    DEFAULT_FILTERS.gamemode
  );

  const division =
    gamemode === "competitive"
      ? pickOptionalOption(firstValue(searchParams.division), DIVISION_OPTIONS)
      : undefined;

  return {
    platform: pickOption(
      firstValue(searchParams.platform),
      PLATFORM_OPTIONS,
      DEFAULT_FILTERS.platform
    ),
    gamemode,
    region: pickOption(
      firstValue(searchParams.region),
      REGION_OPTIONS,
      DEFAULT_FILTERS.region
    ),
    role: pickOptionalOption(firstValue(searchParams.role), ROLE_OPTIONS),
    division,
    order: pickOption(
      firstValue(searchParams.order),
      ORDER_OPTIONS,
      DEFAULT_FILTERS.order
    ),
  };
}

export function getHeroStatsFiltersKey(filters: HeroStatsFilters) {
  return [
    filters.platform,
    filters.gamemode,
    filters.region,
    filters.role ?? "all-roles",
    filters.division ?? "all-divisions",
    filters.order,
  ].join(":");
}

export function HeroStatsFiltersBar({
  filters,
}: {
  filters: HeroStatsFilters;
}) {
  return (
    <section className="border-y bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <FilterGroup
          label="플랫폼"
          param="platform"
          options={PLATFORM_OPTIONS}
          value={filters.platform}
          filters={filters}
        />
        <FilterGroup
          label="게임 모드"
          param="gamemode"
          options={GAMEMODE_OPTIONS}
          value={filters.gamemode}
          filters={filters}
        />
        <FilterGroup
          label="지역"
          param="region"
          options={REGION_OPTIONS}
          value={filters.region}
          filters={filters}
        />
        <FilterGroup
          label="역할"
          param="role"
          options={ROLE_OPTIONS}
          value={filters.role}
          filters={filters}
        />
        <FilterGroup
          label="티어"
          param="division"
          options={DIVISION_OPTIONS}
          value={filters.division}
          filters={filters}
          disabled={filters.gamemode !== "competitive"}
        />
        <FilterGroup
          label="정렬"
          param="order"
          options={ORDER_OPTIONS}
          value={filters.order}
          filters={filters}
        />
      </div>
    </section>
  );
}

export async function HeroStatsDataSection({
  filters,
}: {
  filters: HeroStatsFilters;
}) {
  const result = await loadHeroStatsData(filters);

  if (result.status === "error") {
    return (
      <HeroStatsSectionError
        title={result.title}
        description={result.description}
        isExpectedOutage={result.isExpectedOutage}
      />
    );
  }

  return (
    <HeroStatsTableSection
      stats={result.stats}
      heroes={result.heroes}
      filters={filters}
      isHeroMetaStale={result.isHeroMetaStale}
    />
  );
}

async function loadHeroStatsData(filters: HeroStatsFilters): Promise<
  | {
      status: "ok";
      stats: HeroStatsSummary[];
      heroes: HeroShort[];
      isHeroMetaStale: boolean;
    }
  | {
      status: "error";
      title: string;
      description: string;
      isExpectedOutage: boolean;
    }
> {
  try {
    const api = createOverfastServerApi();
    const [statsResult, heroesResult] = await Promise.allSettled([
      loadHeroStats(api, filters),
      api.listHeroes({
        locale: "ko-kr",
        role: filters.role,
      }),
    ]);

    if (statsResult.status === "rejected") {
      logHeroStatsFailure(statsResult.reason, filters);

      const isExpectedOutage = isHeroStatsEndpointOutage(statsResult.reason);

      return {
        status: "error",
        title: isExpectedOutage
          ? "영웅 통계 데이터 준비 중"
          : "영웅 통계를 불러오지 못했습니다",
        description: getHeroStatsErrorDescription(statsResult.reason),
        isExpectedOutage,
      };
    }

    const heroes =
      heroesResult.status === "fulfilled" ? heroesResult.value : [];

    if (heroesResult.status === "rejected") {
      console.error("Failed to load OverFast heroes.", heroesResult.reason);
    }

    return {
      status: "ok",
      stats: statsResult.value,
      heroes,
      isHeroMetaStale: heroesResult.status === "rejected",
    };
  } catch (error) {
    console.error("Failed to render hero stats section.", error);

    return {
      status: "error",
      title: "통계 섹션을 준비하지 못했습니다",
      description:
        "요청을 처리하는 동안 문제가 발생했습니다. 페이지의 다른 영역은 계속 사용할 수 있습니다.",
      isExpectedOutage: false,
    };
  }
}

async function loadHeroStats(
  api: ReturnType<typeof createOverfastServerApi>,
  filters: HeroStatsFilters
) {
  let lastError: unknown;

  for (const query of getHeroStatsQueryCandidates(filters)) {
    try {
      const stats = await api.getHeroStats(query);

      return sortHeroStats(stats, filters.order);
    } catch (error) {
      lastError = error;

      if (!isRetriableHeroStatsError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

export function HeroStatsSectionSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-5 w-52" />
        </div>
        <div className="grid gap-1 p-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HeroStatsPageSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-4 h-5 w-28" />
        <Skeleton className="mb-3 h-10 w-full max-w-lg" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </section>
      <section className="border-y">
        <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[96px_1fr]">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </section>
      <HeroStatsSectionSkeleton />
    </main>
  );
}

function HeroStatsTableSection({
  stats,
  heroes,
  filters,
  isHeroMetaStale,
}: {
  stats: HeroStatsSummary[];
  heroes: HeroShort[];
  filters: HeroStatsFilters;
  isHeroMetaStale: boolean;
}) {
  const heroByKey = new Map(heroes.map((hero) => [hero.key, hero]));
  const rows = stats.map((stat) => ({
    ...stat,
    heroMeta: heroByKey.get(stat.hero),
  }));
  const topPickrate = rows.reduce<HeroStatsSummary | undefined>(
    (current, row) =>
      current === undefined || row.pickrate > current.pickrate ? row : current,
    undefined
  );
  const topWinrate = rows.reduce<HeroStatsSummary | undefined>(
    (current, row) =>
      current === undefined || row.winrate > current.winrate ? row : current,
    undefined
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="영웅 수" value={`${rows.length}명`} />
        <Metric
          label="최고 픽률"
          value={
            topPickrate
              ? `${formatHeroName(topPickrate.hero, heroByKey)} ${formatPercent(
                  topPickrate.pickrate
                )}`
              : "-"
          }
        />
        <Metric
          label="최고 승률"
          value={
            topWinrate
              ? `${formatHeroName(topWinrate.hero, heroByKey)} ${formatPercent(
                  topWinrate.winrate
                )}`
              : "-"
          }
        />
      </div>

      {isHeroMetaStale ? (
        <Alert className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>영웅 이름 정보를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>
            통계는 표시하지만 일부 이름과 초상화는 영웅 키로 대체됩니다.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              영웅 픽률 / 승률
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {describeFilters(filters)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {filters.order === "hero:asc" ? (
              <ArrowDownAZ className="size-4" />
            ) : (
              <ArrowDownWideNarrow className="size-4" />
            )}
            {getOrderLabel(filters.order)}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-16 text-right">순위</TableHead>
              <TableHead>영웅</TableHead>
              <TableHead className="text-right">픽률</TableHead>
              <TableHead className="text-right">승률</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <TableRow key={row.hero}>
                  <TableCell className="text-right text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-48 items-center gap-3">
                      <HeroPortrait hero={row.heroMeta} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {row.heroMeta?.name ?? row.hero}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleLabel(row.heroMeta?.role)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPercent(row.pickrate)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPercent(row.winrate)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  현재 필터에 맞는 영웅 통계가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function FilterGroup<Value extends string>({
  label,
  param,
  options,
  value,
  filters,
  disabled = false,
}: {
  label: string;
  param: keyof HeroStatsFilters;
  options: FilterOption<Value>[];
  value?: Value;
  filters: HeroStatsFilters;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[96px_1fr] sm:items-start">
      <div className="pt-1 text-sm font-medium text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          const href = buildHeroStatsHref(filters, {
            [param]: option.value,
          });

          if (disabled) {
            return (
              <span
                key={option.value ?? "all"}
                className="inline-flex h-8 items-center rounded-lg border px-3 text-sm text-muted-foreground opacity-50"
              >
                {option.label}
              </span>
            );
          }

          return (
            <Link
              key={option.value ?? "all"}
              href={href}
              className={cn(
                "inline-flex h-8 items-center rounded-lg border px-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 truncate text-xl font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function HeroStatsSectionError({
  title,
  description,
  isExpectedOutage = false,
}: {
  title: string;
  description: string;
  isExpectedOutage?: boolean;
}) {
  const Icon = isExpectedOutage ? Clock3 : AlertCircle;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Alert variant={isExpectedOutage ? "default" : "destructive"}>
        <Icon className="size-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </section>
  );
}

function HeroPortrait({ hero }: { hero?: HeroShort }) {
  if (!hero?.portrait) {
    return (
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium uppercase text-muted-foreground">
        {hero?.key.slice(0, 2) ?? "OW"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hero.portrait}
      alt={`${hero.name} 초상화`}
      className="size-11 shrink-0 rounded-lg bg-muted object-cover"
      loading="lazy"
    />
  );
}

function buildHeroStatsHref(
  current: HeroStatsFilters,
  updates: Partial<HeroStatsFilters>
) {
  const next: HeroStatsFilters = {
    ...current,
    ...updates,
  };

  if (updates.gamemode === "quickplay") {
    next.division = undefined;
  }

  const params = new URLSearchParams();

  setParam(params, "platform", next.platform, DEFAULT_FILTERS.platform);
  setParam(params, "gamemode", next.gamemode, DEFAULT_FILTERS.gamemode);
  setParam(params, "region", next.region, DEFAULT_FILTERS.region);
  setParam(params, "role", next.role);
  setParam(
    params,
    "division",
    next.gamemode === "competitive" ? next.division : undefined
  );
  setParam(params, "order", next.order, DEFAULT_FILTERS.order);

  const query = params.toString();

  return query ? `/stats/heroes?${query}` : "/stats/heroes";
}

function toHeroStatsQuery(filters: HeroStatsFilters): GetHeroStatsQuery {
  return {
    platform: filters.platform,
    gamemode: filters.gamemode,
    region: filters.region,
    role: filters.role,
    competitive_division:
      filters.gamemode === "competitive" ? filters.division : undefined,
    order_by: filters.order,
  };
}

function toHeroStatsBaseQuery(filters: HeroStatsFilters): GetHeroStatsQuery {
  return {
    platform: filters.platform,
    gamemode: filters.gamemode,
    region: filters.region,
    role: filters.role,
    competitive_division:
      filters.gamemode === "competitive" ? filters.division : undefined,
  };
}

function getHeroStatsQueryCandidates(filters: HeroStatsFilters) {
  const baseQuery = toHeroStatsBaseQuery(filters);
  const candidates = [
    toHeroStatsQuery(filters),
    baseQuery,
    {
      ...baseQuery,
      order_by: DEFAULT_FILTERS.order,
    },
  ] satisfies GetHeroStatsQuery[];
  const seen = new Set<string>();

  return candidates.filter((query) => {
    const key = JSON.stringify(query);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function sortHeroStats(
  stats: HeroStatsSummary[],
  order: HeroStatsOrder
): HeroStatsSummary[] {
  const [field, direction] = order.split(":") as [
    "hero" | "pickrate" | "winrate",
    "asc" | "desc",
  ];
  const directionMultiplier = direction === "asc" ? 1 : -1;

  return [...stats].sort((left, right) => {
    const result =
      field === "hero"
        ? left.hero.localeCompare(right.hero)
        : left[field] - right[field];

    return result * directionMultiplier;
  });
}

function isRetriableHeroStatsError(error: unknown) {
  return error instanceof OverfastApiError && error.status >= 500;
}

function isHeroStatsEndpointOutage(error: unknown) {
  return error instanceof OverfastApiError && error.status >= 500;
}

function logHeroStatsFailure(error: unknown, filters: HeroStatsFilters) {
  if (error instanceof OverfastApiError) {
    console.warn("OverFast hero stats unavailable.", {
      status: error.status,
      statusText: error.statusText,
      data: error.data,
      filters: {
        platform: filters.platform,
        gamemode: filters.gamemode,
        region: filters.region,
        role: filters.role,
        division: filters.division,
        order: filters.order,
      },
    });

    return;
  }

  console.error("Failed to load OverFast hero stats.", error);
}

function getHeroStatsErrorDescription(error: unknown) {
  if (error instanceof OverfastApiError && error.status >= 500) {
    return "OverFast에서 제공하는 영웅 픽률/승률 데이터가 현재 응답하지 않아 통계표를 표시하지 않습니다. 필터는 유지되며, API가 복구되면 같은 조건으로 다시 볼 수 있습니다.";
  }

  return "OverFast의 /heroes/stats 응답이 실패했습니다. 필터는 유지되며, 잠시 후 다시 시도할 수 있습니다.";
}

function firstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function pickOption<Value extends string>(
  value: string | undefined,
  options: FilterOption<Value>[],
  fallback: Value
) {
  return options.some((option) => option.value === value)
    ? (value as Value)
    : fallback;
}

function pickOptionalOption<Value extends string>(
  value: string | undefined,
  options: FilterOption<Value>[]
) {
  return options.some((option) => option.value === value)
    ? (value as Value)
    : undefined;
}

function setParam(
  params: URLSearchParams,
  key: string,
  value?: string,
  defaultValue?: string
) {
  if (value && value !== defaultValue) {
    params.set(key, value);
  }
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function formatHeroName(
  heroKey: HeroStatsSummary["hero"],
  heroes: Map<string, HeroShort>
) {
  return heroes.get(heroKey)?.name ?? heroKey;
}

function describeFilters(filters: HeroStatsFilters) {
  const values = [
    getOptionLabel(PLATFORM_OPTIONS, filters.platform),
    getOptionLabel(GAMEMODE_OPTIONS, filters.gamemode),
    getOptionLabel(REGION_OPTIONS, filters.region),
    getRoleLabel(filters.role),
    filters.gamemode === "competitive"
      ? getOptionLabel(DIVISION_OPTIONS, filters.division)
      : undefined,
  ].filter(Boolean);

  return `${values.join(" / ")} 기준`;
}

function getOptionLabel<Value extends string>(
  options: FilterOption<Value>[],
  value?: Value
) {
  return options.find((option) => option.value === value)?.label;
}

function getRoleLabel(role?: Role) {
  if (!role) {
    return "전체 역할";
  }

  return getOptionLabel(ROLE_OPTIONS, role) ?? role;
}

function getOrderLabel(order: HeroStatsOrder) {
  return getOptionLabel(ORDER_OPTIONS, order) ?? order;
}
