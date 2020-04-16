import moment from "moment";

import { NewBettable } from "@bet/types";

import SportPage from "./pages/sportPage";
import FootballMatchPage, { Members, Price } from "./pages/footballMatchPage";
import { normalizedMarketKey } from "./types";
import { sanitizedEquals } from "./utils";
import { GenericMarket } from "@bet/types/bettable/generic";
import { assertEnv } from "@bet/assert";

assertEnv(process.env, "EVENT_TIME_SPAN_HOURS");
const { EVENT_TIME_SPAN_HOURS } = process.env;

export interface Bet {
  sport: string;
  members: Members;
  date: string;
  url: string;
  price: Price;
  extractTime: Date;
}

declare const document: {
  body: {
    innerHTML: string;
  };
  cookie: string;
  location: {
    reload: () => void;
  };
};

const SPORTS = [
  // { key: "basketball", id: 6 },
  { key: "esports", id: 1895085 },
  { key: "soccer", id: 11 },
  // { key: "hockey", id: 537 },
  // { key: 'tabletennis', id: 382549, },
  // { key: 'tennis', id: 2398, },
];

class MarathonWebsite {
  async *retrieveBets(): AsyncGenerator<Bet> {
    try {
      for (const sport of SPORTS) {
        const sportPage = new SportPage(
          `https://www.marathonbet.com/en/betting/${sport.id}?periodGroupAllEvents=${EVENT_TIME_SPAN_HOURS}`,
        );

        const { urls } = await sportPage.getData();

        for (const url of urls) {
          const eventPage = new FootballMatchPage(url);

          for await (const data of eventPage.getData()) {
            if (data === undefined) {
              continue;
            }
            const extractTime = new Date();

            for (const price of data.prices) {
              const bet: Bet = {
                sport: sport.key,
                members: data.members,
                date: data.date,
                url: data.url,
                extractTime,
                price,
              };

              yield bet;
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function normalizeDate(date: string): Date {
  const parts = date.trim().split(/\s+/);
  if (parts.length === 3) {
    return moment(date, "D MMM HH:mm").toDate();
  } else if (parts.length === 1) {
    return moment(date, "HH:mm").toDate();
  }
  throw new Error(`Cannot normalize date: ${date}`);
}

function normalizeMarket(bet: Bet): GenericMarket {
  let member: string;
  let value: string;
  let operator;
  const key = normalizedMarketKey(bet.price.mn);

  const unit = bet.sport === "soccer" ? "goals" : "maps";

  switch (key) {
    case "game_score_total":
      [, operator, value] = bet.price.sn.match(/(\w+)\s+([\d\.]+)/);
      operator = operator === "Under" ? "under" : "over";

      return {
        kind: "total",
        operation: "over_under",
        period: "match",
        team: "both",
        value: [operator, parseFloat(value)] as [string, number],
        unit,
      };

    case "game_score_handicap":
      [, member, value] = bet.price.sn.match(/(.*) \(([+-]?[\d\.]+)\)/);

      if (sanitizedEquals(bet.members.home, member)) {
        operator = "home";
      } else if (sanitizedEquals(bet.members.away, member)) {
        operator = "away";
      } else {
        throw new Error(
          `Member '${member}' in price.sn '${
            bet.price.sn
          }' doesn't match any of the extracted members in ${JSON.stringify(
            bet.members,
          )} (${bet.url})`,
        );
      }

      return {
        kind: "handicap",
        operation: "spread",
        period: "match",
        team: null,
        value: [operator, parseFloat(value)] as [string, number],
        unit,
      };

    default:
      throw new Error(`Market key '${key}' not found!`);
  }
}

function normalizeBet(bet: Bet): NewBettable {
  return {
    odd: parseFloat(bet.price.epr),
    market: normalizeMarket(bet),
    house: "marathon",
    sport: bet.sport.toLowerCase().replace(/[^a-z]/g, ""),
    event: {
      league: null,
      starts_at: normalizeDate(bet.date),
      participants: {
        home: bet.members.home,
        away: bet.members.away,
      },
    },
    extracted_at: bet.extractTime,
    url: bet.url,
  };
}

export default async function* retriveBets() {
  const website = new MarathonWebsite();
  for await (const bet of website.retrieveBets()) {
    yield normalizeBet(bet);
  }
}
