import { MongoClient, Db } from "mongodb";
import { assertEnv } from "@bet/assert";

assertEnv(process.env, ["MONGODB_CONNECTION_URI"]);

const { MONGODB_CONNECTION_URI } = process.env;

export default class DB {
  private static instance: DB;
  private client: MongoClient;
  private db: Db;

  private constructor() {}

  async connect() {
    this.client = await MongoClient.connect(MONGODB_CONNECTION_URI);
    this.db = this.client.db("betterbet");
    return this.db;
  }

  async close() {
    return this.client.close();
  }

  static getInstance() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  static async resetDb() {
    await this.getInstance().db.collection("bettables").drop();
    await this.getInstance().db.createCollection("bettables");
    const collection = await this.getInstance().db.collection("bettables");
    await collection.createIndex({
      market: 1,
      house: 1,
      sport: 1,
      event: 1,
    });
  }
}
