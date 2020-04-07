import retrieveBets from "./scraper";

import DB from "@bet/db";
import store from "./storage";

const NAME = "Marathon";

async function run() {
  console.log(`Starting ${NAME} sync.`);
  console.time(NAME);

  let count = 0;
  for await (const bettable of retrieveBets()) {
    store(bettable);
    count++;
  }
  console.log(`${NAME} ended with ${count} bets found. Time spent:`);
  console.timeEnd(NAME);

  setTimeout(() => {
    run();
  }, 0);
}

async function main() {
  await DB.getInstance().connect();
  run();
}

main().then().catch(console.error);
