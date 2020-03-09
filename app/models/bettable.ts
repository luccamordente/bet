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
  return new Promise((resolve, reject) => {
    db.collection('bettables').insertOne(bettable, (error) => {
      if (error !== null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
}

export {
  save,
  Bettable
};