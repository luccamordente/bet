import DB from "@bet/db";

import { Bettable } from "./bettable";

export type Stakeable = Bettable & {
  stake: number;
};

type Combination = [Stakeable, Stakeable];

export type Opportunity = {
  _id?: string;
  stakeables: Combination;
  profit: number;
  createdAt: Date;
  updatedAt: Date;
};

function generateId(opportunity: Opportunity): string {
  return opportunity.stakeables
    .map((s) => s._id.toString())
    .sort()
    .join("/");
}

/**
 * Creates a new opportunity if it doesn't exist in the database.
 * If it does, updates it only if the profit found is greater than
 * the previous one recorded.
 * @returns `true` if the opportunity was saved or updated on the database
 * or `false` if no operation was done on the database.
 */
export async function save(opportunity: Opportunity): Promise<boolean> {
  const { db } = DB.getInstance();
  const collection = db.collection("opportunities");

  const id = generateId(opportunity);
  opportunity._id = id;

  const old = await collection.findOne({ _id: id });
  if (old === null) {
    await collection.insertOne(opportunity);
    return true;
  } else if (opportunity.profit > old.profit) {
    opportunity.updatedAt = opportunity.createdAt;
    opportunity.createdAt = old.createdAt;
    await collection.replaceOne({ _id: id }, opportunity);
    return true;
  }
  return false;
}
