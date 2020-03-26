import MongoClient from "mongodb";

export default class DB {
  private static instance;
  private client;
  private db;

  private constructor () {}

  async connect() {
    this.client = await new MongoClient("mongodb://mongodb");

    return new Promise((resolve, reject) => {
      this.client.connect((error, conn) => {
        if (error === null) {
          this.db = conn.db('betterbet');
          resolve(this.db);
        } else {
          reject(error);
        }
      });
    });
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
    await this.getInstance().db.collection('bettables').drop();
    await this.getInstance().db.createCollection("bettables");
    const collection = await this.getInstance().db.collection('bettables');
    await collection.createIndex({ 
      market: 1,
      house: 1,
      sport: 1,
      event: 1
    });
  }
}