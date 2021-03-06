import { compareTwoStrings } from "string-similarity";
import moment from "moment";

import DB from "@bet/db";
import { Bettable } from "@bet/types";

import { getCollection } from "./models/bettable";

import group from "./utils/group";
import compare from "./utils/comparator";
import { save as saveOpportunity, Opportunity } from "./models/opportunity";
import {
  profitToString,
  sportToString,
  comparableToString,
  bettableToString,
  marketToString,
} from "./utils/string";
import publishOpportunity from "./publishOpportunity";
import heart from "./heart";
import server from "./server";

const MAXIMUM_EXTRACT_MINUTES = 2;

const MINIMUM_PROFIT_TO_PUBLISH = 0.02;

const PARTICIPANT_NAME_SANITIZERS = [
  // E-sports: some strings are clipped, so this matches espo
  /\s?\be\-?spor?t?s?\b\s?/i,

  // Club / Clube
  /\s?\bclube?\b\s?/i,

  // Under some age: U-20, etc
  /\s?\bu\-?\d+\b\s?/i,

  // Futebol Clube: FC, Fc
  /\s?\bfc\b\s?/i,

  // Clube Desportivo: Cd
  /\s?\bcd\b\s?/i,

  // Youth
  /\s?\byouth\b\s?/i,

  // Women
  /\s?\bwomen\b\s?/i,
];

function announceComparison(opportunity: Opportunity) {
  const [a, b] = opportunity.stakeables;
  console.group(
    `${profitToString(opportunity.profit)} ${sportToString(
      a.sport,
    )} 🛒 ${marketToString(a)}`,
  );
  console.log(comparableToString(a));
  console.log(comparableToString(b));
  console.groupEnd();
}

function announceOpportunity(profitable: Opportunity): void {
  const [b1, b2] = profitable.stakeables;
  console.group(
    `${profitToString(profitable.profit)} profit opportunity! ${
      profitable._id
    }`,
  );
  console.log(`${sportToString(b1.sport)} 🛒 ${marketToString(b1)}`);
  console.log(bettableToString(b1));
  console.log(bettableToString(b2));
  console.groupEnd();
}

/**
 * Sanitizes a name using PARTICIPANT_NAME_SANITIZERS
 */
function sanitizeParticipantName(name: string): string {
  let sanitized = name;
  sanitized = sanitized.toLowerCase();
  for (const sanitizer of PARTICIPANT_NAME_SANITIZERS) {
    sanitized = sanitized.replace(sanitizer, "");
  }
  sanitized = sanitized.replace(/[^a-z0-9]/g, "");
  return sanitized;
}

function groupBettables(bettables: Bettable[]) {
  const s = sanitizeParticipantName;
  return group<Bettable>(
    bettables,
    (a, b) => {
      let x;
      let y;
      return (
        a.sport === b.sport &&
        a.event.starts_at.getTime() === b.event.starts_at.getTime() &&
        a.market.kind === b.market.kind &&
        a.market.operation === b.market.operation &&
        // try exact match first
        ((s(a.event.participants.home) === s(b.event.participants.home) &&
          s(a.event.participants.away) === s(b.event.participants.away)) ||
          // then try fuzzy match
          ((x = compareTwoStrings(
            s(a.event.participants.home),
            s(b.event.participants.home),
          )) +
            (y = compareTwoStrings(
              s(a.event.participants.away),
              s(b.event.participants.away),
            )) >
            1 &&
            x > 0.5 &&
            y > 0.5))
      );
    },
    (item) => {
      return {
        sport: item.sport,
        market: {
          kind: item.market.kind,
          operation: item.market.operation,
        },
        event: {
          starts_at: item.event.starts_at,
          participants: item.event.participants,
        },
      };
    },
  );
}

async function getBettables(): Promise<Bettable[]> {
  return await getCollection()
    .find({
      extracted_at: {
        $gt: moment().subtract(MAXIMUM_EXTRACT_MINUTES, "minutes").toDate(),
      },
    })
    .toArray();
}

async function run() {
  console.group(`Starting comparator ${new Date()}`);

  console.log("Fetching bettables");

  // FIXME this is slow
  // TODO add condition to only get valid bettables based on event start time
  let bettables: Bettable[];
  try {
    bettables = await getBettables();
  } catch (error) {
    console.error("Error connecting to database. Will try again.");
    await DB.getInstance().connect();
    setTimeout(run, 5 * 1000);
    return;
  }

  console.log(`${bettables.length} bettables found`);

  console.group("🔀 Comparing");

  const groups = groupBettables(bettables);
  // console.log(JSON.stringify(groups, null, 2))

  let totalCount = 0;
  let profitCount = 0;
  for (const grp of groups) {
    const opportunities = compare(grp.items);
    for (const opportunity of opportunities) {
      if (
        opportunity.profit > 0 &&
        moment(opportunity.stakeables[0].extracted_at).isAfter(
          moment().subtract(10, "minutes"),
        ) &&
        moment(opportunity.stakeables[1].extracted_at).isAfter(
          moment().subtract(10, "minutes"),
        )
      ) {
        if (opportunity.profit > MINIMUM_PROFIT_TO_PUBLISH) {
          announceOpportunity(opportunity);
          saveOpportunity(opportunity).then((isFresh) => {
            if (isFresh) {
              console.log("Fresh opportunity found! Will publish.");
              publishOpportunity(opportunity);
            }
          });
          profitCount++;
        }
      } else {
        // announceComparison(opportunity);
      }
      totalCount++;
    }
  }

  console.log(
    `Found ${profitCount} opportunities in ${totalCount} combinations.`,
  );
  console.groupEnd();
  console.groupEnd();
  heart.beat();

  setTimeout(run, 5 * 1000);
}

async function main() {
  server.listen(8080);
  await DB.getInstance().connect();
  await run();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
