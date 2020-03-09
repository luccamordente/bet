import MongoClient from "mongodb";

export default class DB {
  private static instance;
  private db;

  private constructor () {}

  async connect() {
    const client = await new MongoClient("mongodb+srv://betterbet:tXGvRktFZpXWZUq3@betterbet-cfnll.mongodb.net/betterbet?retryWrites=true&w=majority");

    this.db = new Promise((resolve, reject) => {
      client.connect((error, conn) => {
        if (error === null) {
          const db = conn.db('betterbet');
          console.log(db)
          resolve(db);
        } else {
          reject(error);
        }
      });
    });
  }

  static async getInstance() {
    if (!DB.instance) {
      DB.instance = new DB();
      await DB.instance.connect();
    }
    return DB.instance.db;
  }
}