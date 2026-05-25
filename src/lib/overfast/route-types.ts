export type OverfastHeroRouteContext = {
  params: Promise<{
    hero_key: string;
  }>;
};

export type OverfastPlayerRouteContext = {
  params: Promise<{
    player_id: string;
  }>;
};
