import DB from '../config/db';


type MarketOperation<T> = (
  T extends "over_under"
  ? {
    operator: "over" | "under",
    value: number,
  }
  : never
);

type MarketType<T> = (
  T extends "over_under"
  ? {
    type: T,
    operation: MarketOperation<T>
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

type Odd = number;

interface Bettable {
  odd: Odd,
  market: Market,
  house: "1xbet" | "pinnacle" | "marathon",
  sport: string,
  event: Event,
  extracted_at: Date,
  url: string;
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






