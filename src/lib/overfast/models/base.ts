import type { components } from "../schema";

export type OverfastModels = components["schemas"];
export type OverfastModel<ModelName extends keyof OverfastModels> =
  OverfastModels[ModelName];
