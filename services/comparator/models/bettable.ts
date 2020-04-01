import DB from '@bet/db';

export type MarketType = "over_under" | "spread";

export type MarketOperation<T> = (
  T extends "over_under"
  ? {
    operator: "over" | "under",
    value: number,
  }
  :T extends "spread"
  ? {
    operator: "home" | "away"
    value: number,
  }
  : never
);

type MarketSpecs<T> = (
  T extends MarketType
  ? {
    type: Extract<MarketType, T>,
    operation: MarketOperation<T>
  }
  : never
);

export type MarketKey = "game_score_total" | "game_score_handicap";

// TODO use `context` or period to denote dynamic game/half/map/etc
// depending on the sport.
type GenericBettableMarket<T, M> = {
  key: T extends MarketKey ? T : never
} & MarketSpecs<M>;

// Possible combinations
export type BettableMarket =
  | GenericBettableMarket<"game_score_total", "over_under">
  | GenericBettableMarket<"game_score_handicap", "spread">
;

interface Event {
  league: string,
  starts_at: Date,
  participants: {
    home: string,
    away: string,
  },
};

export type Odd = number;

export interface Bettable {
  _id: string,
  odd: Odd,
  market: BettableMarket,
  house: string
  sport: string,
  event: Event,
  extracted_at: Date,
  url: string,
};

export function getCollection(): any {
  const {db} = DB.getInstance();
  return db.collection('bettables');
}