import createClient from "openapi-fetch";
import type { Client, ClientOptions } from "openapi-fetch";

import { getOverfastApiBaseUrl } from "./config";
import type { HeroKey } from "./models";
import type { operations, paths } from "./schema";

export const OVERFAST_PROXY_BASE_URL = "/api/overfast";
export type OverfastClient = Client<paths>;

type JsonContent<Response> = Response extends {
  content: { "application/json": infer Data };
}
  ? Data
  : never;

export type OverfastOperationId = keyof operations;

export type OverfastOperationQuery<
  OperationId extends OverfastOperationId,
> = operations[OperationId]["parameters"] extends { query?: infer Query }
  ? NonNullable<Query>
  : never;

export type OverfastOperationPath<
  OperationId extends OverfastOperationId,
> = operations[OperationId]["parameters"] extends { path?: infer Path }
  ? NonNullable<Path>
  : never;

export type OverfastOperationData<
  OperationId extends OverfastOperationId,
> = operations[OperationId]["responses"] extends { 200: infer Response }
  ? JsonContent<Response>
  : never;

export type OverfastProxyErrorMessage = {
  error: string;
};

export type OverfastOperationError<
  OperationId extends OverfastOperationId,
> =
  | JsonContent<
      operations[OperationId]["responses"][Exclude<
        keyof operations[OperationId]["responses"],
        200
      >]
    >
  | OverfastProxyErrorMessage;

export type ListHeroesQuery = OverfastOperationQuery<"list_heroes">;
export type ListHeroesData = OverfastOperationData<"list_heroes">;

export type GetHeroStatsQuery = OverfastOperationQuery<"get_hero_stats">;
export type GetHeroStatsData = OverfastOperationData<"get_hero_stats">;

export type GetHeroQuery = OverfastOperationQuery<"get_hero">;
export type GetHeroData = OverfastOperationData<"get_hero">;

export type ListRolesQuery = OverfastOperationQuery<"list_roles">;
export type ListRolesData = OverfastOperationData<"list_roles">;

export type ListMapGamemodesData =
  OverfastOperationData<"list_map_gamemodes">;

export type ListMapsQuery = OverfastOperationQuery<"list_maps">;
export type ListMapsData = OverfastOperationData<"list_maps">;

export type SearchPlayersQuery = OverfastOperationQuery<"search_players">;
export type SearchPlayersData = OverfastOperationData<"search_players">;

export type GetPlayerSummaryData =
  OverfastOperationData<"get_player_summary">;

export type GetPlayerStatsSummaryQuery =
  OverfastOperationQuery<"get_player_stats_summary">;
export type GetPlayerStatsSummaryData =
  OverfastOperationData<"get_player_stats_summary">;

export type GetPlayerCareerStatsQuery =
  OverfastOperationQuery<"get_player_career_stats">;
export type GetPlayerCareerStatsData =
  OverfastOperationData<"get_player_career_stats">;

export type GetPlayerStatsQuery = OverfastOperationQuery<"get_player_stats">;
export type GetPlayerStatsData = OverfastOperationData<"get_player_stats">;

export type GetPlayerCareerQuery =
  OverfastOperationQuery<"get_player_career">;
export type GetPlayerCareerData =
  OverfastOperationData<"get_player_career">;

type OverfastResult<OperationId extends OverfastOperationId> = {
  data?: OverfastOperationData<OperationId>;
  error?: OverfastOperationError<OperationId>;
  response: Response;
};

export class OverfastApiError<ErrorData = unknown> extends Error {
  readonly name = "OverfastApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: ErrorData;
  readonly response: Response;

  constructor(response: Response, data: ErrorData) {
    super(`OverFast API request failed with ${response.status}.`);
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.response = response;
  }
}

export function createOverfastClient(options: ClientOptions = {}) {
  return createOverfastProxyClient(options);
}

export function createOverfastProxyClient(options: ClientOptions = {}) {
  return createClient<paths>({
    baseUrl: OVERFAST_PROXY_BASE_URL,
    ...options,
  });
}

export function createOverfastUpstreamClient(options: ClientOptions = {}) {
  return createClient<paths>({
    baseUrl: getOverfastApiBaseUrl(),
    ...options,
  });
}

export const browserOverfastClient = createOverfastProxyClient();

export async function unwrapOverfastResponse<
  OperationId extends OverfastOperationId,
>(
  responsePromise: Promise<OverfastResult<OperationId>>
): Promise<OverfastOperationData<OperationId>> {
  const result = await responsePromise;

  if (result.error !== undefined) {
    throw new OverfastApiError(result.response, result.error);
  }

  if (result.data === undefined) {
    throw new OverfastApiError(result.response, {
      error: "OverFast API returned an empty response.",
    });
  }

  return result.data;
}

export function createOverfastApi(
  client: OverfastClient = createOverfastProxyClient()
) {
  return {
    listHeroes(query?: ListHeroesQuery) {
      return unwrapOverfastResponse<"list_heroes">(
        client.GET("/heroes", {
          params: { query },
        })
      );
    },

    getHeroStats(query: GetHeroStatsQuery) {
      return unwrapOverfastResponse<"get_hero_stats">(
        client.GET("/heroes/stats", {
          params: { query },
        })
      );
    },

    getHero(heroKey: HeroKey, query?: GetHeroQuery) {
      return unwrapOverfastResponse<"get_hero">(
        client.GET("/heroes/{hero_key}", {
          params: {
            path: { hero_key: heroKey },
            query,
          },
        })
      );
    },

    listRoles(query?: ListRolesQuery) {
      return unwrapOverfastResponse<"list_roles">(
        client.GET("/roles", {
          params: { query },
        })
      );
    },

    listMapGamemodes() {
      return unwrapOverfastResponse<"list_map_gamemodes">(
        client.GET("/gamemodes")
      );
    },

    listMaps(query?: ListMapsQuery) {
      return unwrapOverfastResponse<"list_maps">(
        client.GET("/maps", {
          params: { query },
        })
      );
    },

    searchPlayers(query: SearchPlayersQuery) {
      return unwrapOverfastResponse<"search_players">(
        client.GET("/players", {
          params: { query },
        })
      );
    },

    getPlayerSummary(playerId: string) {
      return unwrapOverfastResponse<"get_player_summary">(
        client.GET("/players/{player_id}/summary", {
          params: {
            path: { player_id: playerId },
          },
        })
      );
    },

    getPlayerStatsSummary(
      playerId: string,
      query?: GetPlayerStatsSummaryQuery
    ) {
      return unwrapOverfastResponse<"get_player_stats_summary">(
        client.GET("/players/{player_id}/stats/summary", {
          params: {
            path: { player_id: playerId },
            query,
          },
        })
      );
    },

    getPlayerCareerStats(playerId: string, query: GetPlayerCareerStatsQuery) {
      return unwrapOverfastResponse<"get_player_career_stats">(
        client.GET("/players/{player_id}/stats/career", {
          params: {
            path: { player_id: playerId },
            query,
          },
        })
      );
    },

    getPlayerStats(playerId: string, query: GetPlayerStatsQuery) {
      return unwrapOverfastResponse<"get_player_stats">(
        client.GET("/players/{player_id}/stats", {
          params: {
            path: { player_id: playerId },
            query,
          },
        })
      );
    },

    getPlayerCareer(playerId: string, query?: GetPlayerCareerQuery) {
      return unwrapOverfastResponse<"get_player_career">(
        client.GET("/players/{player_id}", {
          params: {
            path: { player_id: playerId },
            query,
          },
        })
      );
    },
  } as const;
}

export const browserOverfastApi = createOverfastApi(browserOverfastClient);
