import type { NextRequest } from "next/server";

import {
  OVERFAST_REQUEST_TIMEOUT_MS,
  getOverfastApiBaseUrl,
} from "./config";

const FORWARDED_RESPONSE_HEADERS = [
  "age",
  "cache-control",
  "content-type",
  "etag",
  "last-modified",
  "retry-after",
  "x-cache-status",
  "x-cache-ttl",
];

export type OverfastProxyMethod = "GET" | "HEAD";

export function createOverfastPath(...segments: string[]) {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

export async function proxyOverfastRequest(
  request: NextRequest,
  path: string,
  method: OverfastProxyMethod = "GET"
) {
  let targetUrl: URL;

  try {
    targetUrl = createTargetUrl(request, path);
  } catch {
    return Response.json(
      { error: "OverFast API base URL is invalid." },
      { status: 500 }
    );
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(targetUrl, {
      method,
      headers: createRequestHeaders(request),
      cache: "no-store",
      signal: AbortSignal.timeout(OVERFAST_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (isAbortError(error)) {
      return Response.json(
        { error: "OverFast API request timed out." },
        { status: 504 }
      );
    }

    return Response.json(
      { error: "OverFast API is currently unreachable." },
      { status: 502 }
    );
  }

  return new Response(method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: createResponseHeaders(upstreamResponse.headers),
  });
}

function createTargetUrl(request: NextRequest, path: string) {
  const baseUrl = new URL(getOverfastApiBaseUrl());
  const basePath = baseUrl.pathname.replace(/\/+$/, "");
  const proxyPath = path.startsWith("/") ? path : `/${path}`;

  baseUrl.pathname = `${basePath}${proxyPath}`;
  baseUrl.search = request.nextUrl.search;

  return baseUrl;
}

function createRequestHeaders(request: NextRequest) {
  const headers = new Headers();
  const accept = request.headers.get("accept");
  const acceptLanguage = request.headers.get("accept-language");

  if (accept) {
    headers.set("accept", accept);
  }

  if (acceptLanguage) {
    headers.set("accept-language", acceptLanguage);
  }

  headers.set("user-agent", "ow-gg overfast proxy");

  return headers;
}

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

function createResponseHeaders(upstreamHeaders: Headers) {
  const headers = new Headers();

  for (const header of FORWARDED_RESPONSE_HEADERS) {
    const value = upstreamHeaders.get(header);

    if (value) {
      headers.set(header, value);
    }
  }

  return headers;
}
