import DB from "@bet/db";
import { NewBettable } from "@bet/types";

async function save(bettable: NewBettable): Promise<void> {
  const { db } = DB.getInstance();
  return db.collection("bettables").replaceOne(
    {
      market: bettable.market,
      house: bettable.house,
      sport: bettable.sport,
      event: bettable.event,
    },
    bettable,
    { upsert: true },
  );
}

export { save };
