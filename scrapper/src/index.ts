'use strict';

import OneXBetRetriveBetsAndUpdateDb from  './houses/1xbet';
import PinnacleRetriveBetsAndUpdateDb from  './houses/pinnacle';

import DB from './config/db';

async function main() {
  await DB.getInstance().connect();

  await PinnacleRetriveBetsAndUpdateDb();
  await OneXBetRetriveBetsAndUpdateDb();
}

main();