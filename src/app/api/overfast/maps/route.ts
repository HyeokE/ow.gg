import type { NextRequest } from "next/server";

import { createOverfastPath, proxyOverfastRequest } from "@/lib/overfast/proxy";

const PATH = createOverfastPath("maps");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return proxyOverfastRequest(request, PATH);
}

export function HEAD(request: NextRequest) {
  return proxyOverfastRequest(request, PATH, "HEAD");
}
