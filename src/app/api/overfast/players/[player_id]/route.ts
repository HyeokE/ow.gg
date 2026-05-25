import type { NextRequest } from "next/server";

import { createOverfastPath, proxyOverfastRequest } from "@/lib/overfast/proxy";
import type { OverfastPlayerRouteContext } from "@/lib/overfast/route-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: OverfastPlayerRouteContext
) {
  const { player_id } = await context.params;

  return proxyOverfastRequest(
    request,
    createOverfastPath("players", player_id)
  );
}

export async function HEAD(
  request: NextRequest,
  context: OverfastPlayerRouteContext
) {
  const { player_id } = await context.params;

  return proxyOverfastRequest(
    request,
    createOverfastPath("players", player_id),
    "HEAD"
  );
}
