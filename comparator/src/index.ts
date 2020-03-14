'use strict';

import { compareTwoStrings } from 'string-similarity';

import DB from './config/db';

import { Bettable, getCollection } from './models/bettable';

import group from './utils/group';
import compare from './utils/comparator';

async function run() {
  console.log("\n\n-------------------------------------------------------\n");
  console.log(`Running comparator ${new Date()}`);

  // FIXME this is slow
  const bettables = await getCollection().find().toArray();

  const groups = group(bettables, (a, b) => {
    return a.sport === b.sport
      && a.event.starts_at.getTime() === b.event.starts_at.getTime()
      && a.market.key === b.market.key
      && a.market.type === b.market.type
      && (
        // try exact match first
        (
          a.event.participants.home === b.event.participants.home
          && a.event.participants.away === b.event.participants.away
        )
        ||
        // then try fuzzy match
        (
          compareTwoStrings(a.event.participants.home, b.event.participants.home)
          + compareTwoStrings(a.event.participants.away, b.event.participants.away)
          > 1
        )
      );
  }, (item) => {
    return {
      sport: item.sport,
      market: {
        key: item.market.key,
        type: item.market.type,
      },
      event: {
        starts_at: item.event.starts_at,
        participants: item.event.participants,
      },
    }
  });


  let count = 0;
  for (const grp of groups) {
    const comparables = compare(grp.items);
    for (const c of comparables) {
      if (c.profit > 0) {
        console.log(`${Math.round(c.profit*10000)/100}%`, c.bettables);
        count++;
      }
    }
  }
  console.log(`Found ${count} opportunities`);

  setTimeout(run, 30 * 1000);
}

async function main() {
  await DB.getInstance().connect();
  await run();
}

main().catch(e => { throw e; });