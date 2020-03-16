import axios from 'axios';
import moment from 'moment';

import { americanToDecimal } from '../utils/odds';

import { save as saveBettable, Bettable } from '../models/bettable';

const DEFAULT_REQUEST_CONFIG = {
    headers: {"accept":"application/json","content-type":"application/json","x-api-key":"CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R","x-device-uuid":"995eb6f3-65211f6e-e22c04e9-42a211b8", referrer: "https://www.pinnacle.com/en/soccer/leagues/","referrerPolicy":"no-referrer-when-downgrade",},
    withCredentials: false,
  }

const API_HOST = "https://guest.api.arcadia.pinnacle.com/0.1"
const FOOTBALL_ID = 29;
const TIME_SPAN_HOURS = 12;

type Id = number;

interface League {
  readonly id: Id,
  readonly name: string,
};

interface Participant {
  alignment: "home" | "away",
  name: string,
};

interface Match {
  readonly id: Id,
  readonly startTime: Date,
  readonly league: League,
  readonly participants: [
    Participant & { alignment: "home" },
    Participant & { alignment: "away" },
  ],
  readonly type: "matchup",
  readonly units: "Regular",
};

type BetPeriod = 0 | 1 | 2;
type BetType = "total";

interface BetPrice {
  readonly designation: "over" | "under",
  readonly points: number,
  readonly price: number,
};

interface Bet {
  readonly type: BetType,
  readonly period: BetPeriod,
  readonly match: Match,
  readonly price: BetPrice,
  readonly extractTime: Date,
};

interface Market {
  readonly type: BetType,
  readonly period: BetPeriod,
  readonly match: Match,
  readonly prices: BetPrice[],
};


async function getSportLeagues(sportId: Id): Promise<League[]> {
  let leagues: League[];
  try {
    leagues = (await axios.get(`${API_HOST}/sports/${sportId}/leagues?all=false`, DEFAULT_REQUEST_CONFIG)).data;
  } catch (error) {
    console.error(`Error getting sport leagues from sport ${sportId}`, error);
    return [];
  }
  return leagues;
}

async function* getMatchBets(matchId: Id) {
  let markets: (Bet & Market)[];
  let extractTime;
  try {
    markets = (await axios.get(`${API_HOST}/matchups/${matchId}/markets/related/straight`, DEFAULT_REQUEST_CONFIG)).data;
    extractTime = new Date();
  } catch (error) {
    console.error(`Error getting match bets from matcg ${matchId}`, error);
    return [];
  }

  const bets: Bet[] = [];

  // Split market into bets
  for (const market of filterMarkets(markets)) {
    for (const price of market.prices) {
      const bet: Bet = Object.assign(
        {
          price,
          extractTime,
          prices: undefined,
        },
        market,
      );
      yield bet;
    };
  }
}

async function getLeagueMatches(leagueId: Id): Promise<Match[]> {
  let matches: Match[];
  try {
    matches = (await axios.get(`${API_HOST}/leagues/${leagueId}/matchups`, DEFAULT_REQUEST_CONFIG)).data;
  } catch (error) {
    console.error(`Error getting league matches from league ${leagueId}`, error);
    return [];
  }
  return filterMatches(matches);
}

function filterMatches(matches: Match[]): Match[] {
  return matches.filter((match: Match) => {
    return moment(match.startTime).isBetween(moment.now(), moment().add(TIME_SPAN_HOURS, 'hours')) && match.type === "matchup" && match.units === "Regular";
  });
}

function filterMarkets(markets: Market[]): Market[] {
  return markets.filter(market => {
    return market.type === "total" && market.period === 0
  });
}

function normalizeBet(bet: Bet): Bettable {
  return {
    odd: americanToDecimal(bet.price.price),
    market: {
      key: "total_points",
      type: "over_under",
      operation: {
        operator: bet.price.designation,
        value: bet.price.points
      },
    },
    house: "pinnacle",
    sport: "football",
    event: {
      league: bet.match.league.name,
      starts_at: new Date(bet.match.startTime),
      participants: {
        home: bet.match.participants[0].name,
        away: bet.match.participants[1].name,
      },
    },
    extracted_at: bet.extractTime,
    url: `https://www.pinnacle.com/pt/soccer/a/b/${bet.match.id}/`,
  };
}

/**
 * Gets all bets available from all matches of all football leagues
 */
async function* retriveBets() {
  const leagues: League[] = await getSportLeagues(FOOTBALL_ID);
  const bets: Bet[] = [];

  for(const league of leagues) {
    console.log(`Pinnacle: Processing league ${league.id}`);
    const matches: Match[] = await getLeagueMatches(league.id);

    for (const match of matches) {
      console.log(`Pinnacle: Processing match ${match.id} on league ${match.league.id}`);

      for await (const bet of getMatchBets(match.id)) {
        console.log(`Pinnacle: Processing bet ${americanToDecimal(bet.price.price)} on match ${match.id}`);
        yield Object.assign(bet, { match });
      }
    }
  }

  return;
}

export default async function retriveBetsAndUpdateDb(): Promise<number> {
  let savedCount = 0;

  for await (const bet of retriveBets()) {
    const bettable = normalizeBet(bet);
    console.log(`Pinnacle: Saving bettable ${bettable.odd}`);
    saveBettable(bettable);
    savedCount++;
  }

  return savedCount;
}



