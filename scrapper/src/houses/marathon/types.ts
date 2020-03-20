import { MarketKey } from "../../models/bettable";

export enum MarketName {
  TOTAL_GOALS = 'Total Goals',
  TOTAL_POINTS = 'Total Points',
  TO_WIN_MATCH_WITH_HANDICAP = 'To Win Match With Handicap',
};

export const NORMALIZED_MARKET_KEY: Record<MarketName, MarketKey> = {
  [MarketName.TOTAL_GOALS]: 'game_score_total',
  [MarketName.TOTAL_POINTS]: 'game_score_total',
  [MarketName.TO_WIN_MATCH_WITH_HANDICAP]: 'game_score_handicap',
};

export function normalizedMarketKey(marketName: string): MarketKey {
  const key = NORMALIZED_MARKET_KEY[marketName];

  if (key === undefined) {
    throw new Error(`Market key does not exist for market name '${marketName}'`);
  }

  return key;
}