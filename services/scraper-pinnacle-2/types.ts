import * as pinnacle from "./pinnacle-api/types";

export type League = pinnacle.League;

export type Matchup = pinnacle.Matchup;

export type Market = pinnacle.Market;

export interface MarketContext {
  readonly market: Market;
  readonly matchup: Matchup;
}
