'use strict';

import DB from './config/db';

async function main() {
  await DB.getInstance().connect();
  console.log("It works!");
}

main().catch(e => { throw e; });