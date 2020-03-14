'use strict';

import OneXBetRetriveBetsAndUpdateDb from  './houses/1xbet';
import PinnacleRetriveBetsAndUpdateDb from  './houses/pinnacle';

import DB from './config/db';

async function main() {
  await DB.getInstance().connect();
  // await DB.resetDb();

  while (true) {
    console.group(`Starting Pinnacle sync.`);
    console.time('pinnacle');
    const pinnacleBetsCount = await PinnacleRetriveBetsAndUpdateDb();
    console.log(`Pinnable ended with ${pinnacleBetsCount} bets found. Time spent:`);
    console.timeEnd('pinnacle');
    console.groupEnd();

    console.group(`Starting 1xBet sync.`);
    console.time('1xbet');
    const oneXBetsCount = await OneXBetRetriveBetsAndUpdateDb();
    console.log(`1xBet ended with ${oneXBetsCount} bets found. Time spent:`);
    console.timeEnd('1xbet');
    console.groupEnd();
  }
}

main().then().catch(console.error);