import Link from "next/link";
import { Layers, MapPin, Search, X } from "lucide-react";

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
import type {
  GamemodeDetails,
  Map as OverfastMap,
  MapGamemode,
} from "@/lib/overfast/models";
import { cn } from "@/lib/utils";

type MapsSearchParams = Promise<{
  gamemode?: string | string[];
  search?: string | string[];
}>;

type MapsExplorerProps = {
  searchParams: MapsSearchParams;
};

type MapsHrefOptions = {
  gamemode?: MapGamemode;
  search?: string;
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getMapsHref({ gamemode, search }: MapsHrefOptions = {}) {
  const params = new URLSearchParams();

  if (gamemode) {
    params.set("gamemode", gamemode);
  }

  if (search) {
    params.set("search", search);
  }

  const query = params.toString();

  return query ? `/maps?${query}` : "/maps";
}

function isMapGamemode(
  value: string | undefined,
  gamemodes: GamemodeDetails[]
): value is MapGamemode {
  return gamemodes.some((gamemode) => gamemode.key === value);
}

function getFilteredMaps(
  maps: OverfastMap[],
  gamemodes: GamemodeDetails[],
  selectedGamemode: MapGamemode | undefined,
  search: string
) {
  const modeNameByKey = new Map<MapGamemode, string>(
    gamemodes.map((gamemode) => [gamemode.key, gamemode.name])
  );
  const normalizedSearch = search.toLowerCase();

  return maps.filter((map) => {
    const matchesGamemode =
      selectedGamemode === undefined ||
      map.gamemodes.includes(selectedGamemode);

    if (!matchesGamemode) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText = [
      map.key,
      map.name,
      map.location,
      map.country_code ?? "",
      ...map.gamemodes.map((gamemode) => modeNameByKey.get(gamemode) ?? gamemode),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}

function getModeCounts(maps: OverfastMap[]) {
  const counts = new Map<MapGamemode, number>();

  for (const map of maps) {
    for (const gamemode of map.gamemodes) {
      counts.set(gamemode, (counts.get(gamemode) ?? 0) + 1);
    }
  }

  return counts;
}

export async function MapsExplorer({ searchParams }: MapsExplorerProps) {
  const params = await searchParams;
  const search = getFirstParam(params.search)?.trim() ?? "";
  const api = await createOverfastServerApi();
  const [gamemodes, maps] = await Promise.all([
    api.listMapGamemodes(),
    api.listMaps(),
  ]);
  const selectedGamemodeParam = getFirstParam(params.gamemode);
  const selectedGamemode = isMapGamemode(selectedGamemodeParam, gamemodes)
    ? selectedGamemodeParam
    : undefined;
  const filteredMaps = getFilteredMaps(
    maps,
    gamemodes,
    selectedGamemode,
    search
  );
  const modeCounts = getModeCounts(maps);
  const selectedMode = gamemodes.find(
    (gamemode) => gamemode.key === selectedGamemode
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Mode filters</CardTitle>
            <CardDescription>
              Each filter is a server link, so the URL is shareable.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={<Link href={getMapsHref({ search })} />}
              size="sm"
              variant={selectedGamemode ? "outline" : "default"}
            >
              All modes
            </Button>
            {gamemodes.map((gamemode) => (
              <Button
                key={gamemode.key}
                nativeButton={false}
                render={
                  <Link href={getMapsHref({ gamemode: gamemode.key, search })} />
                }
                size="sm"
                variant={
                  gamemode.key === selectedGamemode ? "default" : "outline"
                }
              >
                {gamemode.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Search maps</CardTitle>
            <CardDescription>
              Search names, locations, countries, and mode names.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/maps" className="flex gap-2">
              {selectedGamemode ? (
                <input
                  name="gamemode"
                  type="hidden"
                  value={selectedGamemode}
                />
              ) : null}
              <Input
                aria-label="Search maps"
                defaultValue={search}
                name="search"
                placeholder="King's Row, Morocco, Push..."
                type="search"
              />
              <Button aria-label="Search" size="icon" type="submit">
                <Search />
              </Button>
              {search ? (
                <Button
                  aria-label="Clear search"
                  nativeButton={false}
                  render={
                    <Link href={getMapsHref({ gamemode: selectedGamemode })} />
                  }
                  size="icon"
                  variant="ghost"
                >
                  <X />
                </Button>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {gamemodes.map((gamemode) => {
          const isSelected = gamemode.key === selectedGamemode;

          return (
            <Link
              className={cn(
                "group rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/50",
                isSelected && "border-brand-orange bg-accent/40"
              )}
              href={getMapsHref({ gamemode: gamemode.key, search })}
              key={gamemode.key}
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <span
                    aria-hidden="true"
                    className="size-6 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${gamemode.icon})` }}
                  />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold">{gamemode.name}</h2>
                    <Badge variant={isSelected ? "default" : "secondary"}>
                      {modeCounts.get(gamemode.key) ?? 0}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {gamemode.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Showing</p>
          <h2 className="text-2xl font-semibold tracking-normal">
            {filteredMaps.length} maps
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedMode ? (
            <Badge variant="default">{selectedMode.name}</Badge>
          ) : (
            <Badge variant="secondary">All modes</Badge>
          )}
          {search ? <Badge variant="outline">Search: {search}</Badge> : null}
          {(selectedGamemode || search) && (
            <Button
              nativeButton={false}
              render={<Link href="/maps" />}
              size="sm"
              variant="ghost"
            >
              <X data-icon="inline-start" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {filteredMaps.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMaps.map((map) => (
            <MapCard
              gamemodes={gamemodes}
              key={map.key}
              map={map}
              selectedGamemode={selectedGamemode}
            />
          ))}
        </div>
      ) : (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>No maps found</CardTitle>
            <CardDescription>
              Clear the current filters or try a broader search term.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </section>
  );
}

function MapCard({
  gamemodes,
  map,
  selectedGamemode,
}: {
  gamemodes: GamemodeDetails[];
  map: OverfastMap;
  selectedGamemode: MapGamemode | undefined;
}) {
  const modeNameByKey = new Map<MapGamemode, string>(
    gamemodes.map((gamemode) => [gamemode.key, gamemode.name])
  );

  return (
    <Card className="rounded-lg py-0">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <div
          aria-label={`${map.name} screenshot`}
          className="size-full bg-cover bg-center transition-transform duration-300 group-hover/card:scale-105"
          role="img"
          style={{ backgroundImage: `url(${map.screenshot})` }}
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{map.name}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {map.location}
              {map.country_code ? ` (${map.country_code})` : ""}
            </CardDescription>
          </div>
          <Badge variant="outline">{map.key}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-2">
          {map.gamemodes.map((gamemode) => (
            <Badge
              key={gamemode}
              variant={gamemode === selectedGamemode ? "default" : "secondary"}
            >
              <Layers data-icon="inline-start" />
              {modeNameByKey.get(gamemode) ?? gamemode}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MapsExplorerSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-36 rounded-lg" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton className="h-28 rounded-lg" key={index} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton className="aspect-[4/3] rounded-lg" key={index} />
        ))}
      </div>
    </section>
  );
}
