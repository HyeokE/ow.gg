import type { NextRequest } from "next/server";

import { createOverfastPath, proxyOverfastRequest } from "@/lib/overfast/proxy";
import type { OverfastHeroRouteContext } from "@/lib/overfast/route-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: OverfastHeroRouteContext
) {
  const { hero_key } = await context.params;

  return proxyOverfastRequest(request, createOverfastPath("heroes", hero_key));
}

export async function HEAD(
  request: NextRequest,
  context: OverfastHeroRouteContext
) {
  const { hero_key } = await context.params;

  return proxyOverfastRequest(
    request,
    createOverfastPath("heroes", hero_key),
    "HEAD"
  );
}
