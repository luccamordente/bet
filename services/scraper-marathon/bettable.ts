import DB from "@bet/db";
import { NewBettable } from "@bet/types";

async function save(bettable: NewBettable) {
  const { db } = DB.getInstance();
  return await db.collection("bettables").replaceOne(
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
