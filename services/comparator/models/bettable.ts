import DB from "@bet/db";

export function getCollection(): any {
  const { db } = DB.getInstance();
  return db.collection("bettables");
}
