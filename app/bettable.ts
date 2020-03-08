type MarketType<T> = { type: T } & (
  T extends "over_under"
  ? {
    type: T,
    operation: {
      operator: "over" | "under",
      value: number,
    },
  }
  : never
);

type Market =
  MarketType<"over_under"> & { key: "total_points" }
  | MarketType<"over_under"> & { key: "total_corners" }

interface Bettable {
  odd: number,
  market: Market,
  house: "1xbet" | "pinnacle",
  sport: "football",
  event: {
    league: string,
    starts_at: Date,
    participants: {
      home: string,
      away: string,
    },
  },
};

export { Bettable };