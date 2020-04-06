import retrieveBets from "./houses/marathon";
import { save, Bettable } from "./models/bettable";

import DB from "@bet/db";

const NAME = "Marathon";
const SCRAPPING_INTERVAL = 10 * 1000; // 10 seconds

function logBettable(bettable: Bettable) {
  const {
    sport,
    market,
    odd,
    event: { starts_at, participants },
    url,
  } = bettable;

  console.log(
    `💾 Marathon ${sport} ${market.key}` +
      ` (${market.operation.operator} ${market.operation.value} ⇢ ${
        Math.round(odd * 100) / 100
      })` +
      ` ${starts_at} ${starts_at.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: undefined,
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZoneName: "short",
      })}` +
      ` ${participants.home} × ${participants.away}` +
      ` ${url}`,
  );
}

async function run() {
  console.log(`Starting ${NAME} sync.`);
  console.time(NAME);

  let count = 0;
  for await (const bettable of retrieveBets()) {
    logBettable(bettable);
    save(bettable).catch((error) => {
      console.error(error);
    });
    count++;
  }
  console.log(`${NAME} ended with ${count} bets found. Time spent:`);
  console.timeEnd(NAME);

  setTimeout(() => {
    run();
  }, SCRAPPING_INTERVAL);
}

async function main() {
  await DB.getInstance().connect();
  run();
}

main().then().catch(console.error);
