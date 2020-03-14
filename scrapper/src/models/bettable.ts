import DB from '../config/db';

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

interface Event {
  league: string,
  starts_at: Date,
  participants: {
    home: string,
    away: string,
  },
};

interface Bettable {
  odd: number,
  market: Market,
  house: "1xbet" | "pinnacle",
  sport: "football",
  event: Event,
};

async function save(bettable: Bettable): Promise<void> {
  const {db} = DB.getInstance();
  return db.collection('bettables').replaceOne({
      market: bettable.market,
      house: bettable.house,
      sport: bettable.sport,
      event: bettable.event,
    }, bettable, {upsert: true});
}

export {
  save,
  Bettable
};