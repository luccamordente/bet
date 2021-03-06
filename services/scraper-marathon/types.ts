export enum MarketName {
  TOTAL_GOALS = "Total Goals",
  TOTAL_POINTS = "Total Points",
  TOTAL_MAPS = "Total Maps",
  TO_WIN_MATCH_WITH_HANDICAP = "To Win Match With Handicap",
  TO_WIN_MATCH_WITH_HANDICAP_BY_MAPS = "To Win Match With Handicap By Maps",
}

export const NORMALIZED_MARKET_KEY: Record<MarketName, string> = {
  [MarketName.TOTAL_GOALS]: "game_score_total",
  [MarketName.TOTAL_POINTS]: "game_score_total",
  [MarketName.TOTAL_MAPS]: "game_score_total",
  [MarketName.TO_WIN_MATCH_WITH_HANDICAP]: "game_score_handicap",
  [MarketName.TO_WIN_MATCH_WITH_HANDICAP_BY_MAPS]: "game_score_handicap",
};

export function normalizedMarketKey(marketName: string): string {
  const key = NORMALIZED_MARKET_KEY[marketName];

  if (key === undefined) {
    throw new Error(
      `Market key does not exist for market name '${marketName}'`,
    );
  }

  return key;
}
