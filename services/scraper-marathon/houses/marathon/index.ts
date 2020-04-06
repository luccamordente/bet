import puppeteer from "puppeteer";
import moment from "moment";

import { Bettable, BettableMarket, MarketType } from "../../models/bettable";

import SportPage from "./pages/sportPage";
import FootballMatchPage, { Members, Price } from "./pages/footballMatchPage";
import { normalizedMarketKey } from "./types";
import { sanitizedEquals } from "../../utils";

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
  { key: "basketball", id: 6 },
  { key: "esports", id: 1895085 },
  { key: "soccer", id: 11 },
  { key: "hockey", id: 537 },
  // { key: 'tabletennis', id: 382549, },
  // { key: 'tennis', id: 2398, },
];
const TIME_SPAN_HOURS = 24;

class MarathonWebsite {
  async *retrieveBets(): AsyncGenerator<Bet> {
    try {
      for (const sport of SPORTS) {
        const sportPage = new SportPage(
          `https://www.marathonbet.com/en/betting/${sport.id}?periodGroupAllEvents=${TIME_SPAN_HOURS}`,
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

function normalizeMarket(bet: Bet): BettableMarket {
  let member: string;
  let value: string;
  let operator;
  let type: MarketType;
  const key = normalizedMarketKey(bet.price.mn);

  switch (key) {
    case "game_score_total":
      [, operator, value] = bet.price.sn.match(/(\w+)\s+([\d\.]+)/);
      operator = operator === "Under" ? "under" : "over";
      type = "over_under";

      return {
        key,
        type: "over_under",
        operation: {
          operator,
          value: parseFloat(value),
        },
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
        key,
        type: "spread",
        operation: {
          operator,
          value: parseFloat(value),
        },
      };

    default:
      throw new Error(`Market key '${key}' not found!`);
  }
}

function normalizeBet(bet: Bet): Bettable {
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
    console.log(JSON.stringify(bet));
    yield normalizeBet(bet);
  }
}
