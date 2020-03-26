import moment from 'moment';

import retrieveBets from './houses/marathon';
import { save } from './models/bettable';

import DB from './config/db';


const NAME = "Marathon";
const SCRAPPING_INTERVAL = 10 * 1000; // 10 seconds

async function run() {
  console.log(`Starting ${NAME} sync.`);
  console.time(NAME);

  let count = 0;
  for await (const bettable of retrieveBets()) {
    console.log(`💾 Marathon ${bettable.sport} ${bettable.market.key} (${bettable.market.operation.operator} ${bettable.market.operation.value} ⇢ ${Math.round(bettable.odd*100)/100})  ${moment(bettable.event.starts_at).format('DD/MM hh:mm')}`);
    save(bettable).catch(error => {
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
