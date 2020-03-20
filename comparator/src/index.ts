import { compareTwoStrings } from 'string-similarity';
import moment from 'moment';

import DB from './config/db';

import { getCollection, Bettable } from './models/bettable';

import group from './utils/group';
import compare, { Profitable } from './utils/comparator';

const MAXIMUM_EXTRACT_MINUTES = 1;

const SPORTS = {
  'basketball': '🏀 Basketball',
  'esports': '🎮 E-Sports',
  'hockey': '🏒 Hockey',
  'soccer': '⚽️ Soccer',
  'tabletennis': '🏓 Table Tennis',
  'tennis': '🎾 Tennis',
};

function oddToString(odd: number): string {
  return `${Math.round(odd*100)/100}`;
}

function profitToString(amount: number): string {
  const percent = `${Math.round(amount*10000)/100}%`;
  return `${amount > 0 ? '🍀' : '🔻'} ${percent}`;
}

function sportToString(sport: string): string {
  return SPORTS[sport];
}

function comparableToString(comparable: Bettable) {
  const {house, event: {participants, starts_at}} = comparable;
  return `🗓  ${moment(starts_at).format('DD/MMM hh:mm')} 🏦 ${house.toUpperCase()} 🎭 ${participants.home} × ${participants.away}`;
}

function announceComparison(combinaton: Profitable) {
  const [a,b] = combinaton.bettables;
  console.group(`🔀 Comparing ${sportToString(a.sport)} ${profitToString(combinaton.profit)}`);
  console.log(comparableToString(a));
  console.log(comparableToString(b));
  console.groupEnd();
}

function bettableToString(bettable: Bettable) {
  const {odd, house, market: {key, operation}, extracted_at, url, event: {participants, starts_at}} = bettable;
  return `🗓  ${moment(starts_at).format('DD/MMM hh:mm')} 🏦 ${house.toUpperCase()} 🎭 ${participants.home} × ${participants.away}
  ✨ ${key.replace('_',' ')}: ${operation.operator} ${operation.value} ⇢ ${oddToString(odd)}
  🕓 ${moment(extracted_at).fromNow()}
  🔗 ${url}`;
}

function announceProfit(profitable: Profitable): void {
  const [b1, b2] = profitable.bettables;
  console.group(`💰 ${sportToString(b1.sport)} ${profitToString(profitable.profit)} profit opportunity!`);
  console.log(bettableToString(b1));
  console.log(bettableToString(b2));
  console.groupEnd();
}

async function run() {
  console.group(`Starting comparator ${new Date()}`);

  console.log('Fetching bettables');

  // FIXME this is slow
  // TODO add condition to only get valid bettables based on event start time
  let bettables;
  try {
    bettables = await getCollection().find({
      extracted_at: { $gt: moment().subtract(MAXIMUM_EXTRACT_MINUTES, 'minutes').toDate() }
    }).toArray();
  } catch (error) {
    console.error("Error connecting to database. Will try again.");
    await DB.getInstance().connect();
    setTimeout(run, 5 * 1000);
    return;
  }

  console.log(`${bettables.length} bettables found`);

  console.group('Comparing');
  const groups = group(bettables, (a, b) => {
    let x, y;
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
          (x = compareTwoStrings(a.event.participants.home, b.event.participants.home))
          + (y = compareTwoStrings(a.event.participants.away, b.event.participants.away))
          > 1
          &&
          x > 0.5
          &&
          y > 0.5
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


  let totalCount = 0;
  let profitCount = 0;
  for (const grp of groups) {
    const comparables = compare(grp.items);
    for (const c of comparables) {
      if (
        c.profit > 0
        && moment(c.bettables[0].extracted_at).isAfter(moment().subtract(10, 'minutes'))
        && moment(c.bettables[1].extracted_at).isAfter(moment().subtract(10, 'minutes'))
      ) {
        announceProfit(c);
        profitCount++;
      } else {
        announceComparison(c);
      }
      totalCount++;
    }
  }

  console.log(`Found ${profitCount} opportunities in ${totalCount} combinations.`);
  console.groupEnd();
  console.groupEnd();

  setTimeout(run, 5 * 1000);
}

async function main() {
  await DB.getInstance().connect();
  await run();
}

main().catch(e => { throw e; });