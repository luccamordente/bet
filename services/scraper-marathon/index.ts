import retrieveBets from "./scraper";

import DB from "@bet/db";
import store from "./storage";
import heart from "./heart";
import server from "./server";

const NAME = "Marathon";

async function run() {
  console.log(`Starting ${NAME} sync.`);
  console.time(NAME);

  let count = 0;
  for await (const bettable of retrieveBets()) {
    store(bettable);
    heart.beat();
    count++;
  }
  console.log(`${NAME} ended with ${count} bets found. Time spent:`);
  console.timeEnd(NAME);

  setTimeout(() => {
    run();
  }, 0);
}

async function main() {
  server.listen(8080);
  await DB.getInstance().connect();
  run();
}

main().then().catch(console.error);
