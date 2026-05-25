export const DEFAULT_OVERFAST_API_BASE_URL = "https://overfast-api.tekrop.fr";
export const OVERFAST_REQUEST_TIMEOUT_MS = 10_000;

export function getOverfastApiBaseUrl() {
  const baseUrl =
    process.env.OVERFAST_API_BASE_URL?.trim() || DEFAULT_OVERFAST_API_BASE_URL;
  const parsedBaseUrl = new URL(baseUrl);

  if (parsedBaseUrl.protocol !== "https:" && parsedBaseUrl.protocol !== "http:") {
    throw new Error("Unsupported OverFast API protocol.");
  }

  return parsedBaseUrl.toString();
}
