'use strict';

import OneXBetRetriveBetsAndUpdateDb from  './houses/1xbet';
import PinnacleRetriveBetsAndUpdateDb from  './houses/pinnacle';

import DB from './config/db';

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  console.log(JSON.stringify(reason))
});

async function main() {
  await DB.getInstance().connect();

  // await OneXBetRetriveBetsAndUpdateDb();
  await PinnacleRetriveBetsAndUpdateDb();

  await DB.getInstance().close();
}

main();