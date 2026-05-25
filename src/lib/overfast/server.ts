import {
  createOverfastApi,
  createOverfastUpstreamClient,
} from "./client";

type OverfastServerApiOptions = {
  revalidate?: number | false;
};

export function createOverfastServerClient({
  revalidate = 3600,
}: OverfastServerApiOptions = {}) {
  return createOverfastUpstreamClient({
    requestInitExt: {
      next: { revalidate },
    },
  });
}

export function createOverfastServerApi(options?: OverfastServerApiOptions) {
  return createOverfastApi(createOverfastServerClient(options));
}
