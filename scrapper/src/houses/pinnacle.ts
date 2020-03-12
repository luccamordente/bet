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
};

interface Market {
  readonly type: BetType,
  readonly period: BetPeriod,
  readonly match: Match,
  readonly prices: BetPrice[],
};


async function getSportLeagues(sportId: Id): Promise<League[]> {
  const response = await axios.get(`${API_HOST}/sports/${sportId}/leagues?all=false`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

async function getMatchBets(matchId: Id): Promise<Bet[]> {
  const markets: (Bet & Market)[] = (await axios.get(`${API_HOST}/matchups/${matchId}/markets/related/straight`, DEFAULT_REQUEST_CONFIG)).data;

  const bets: Bet[] = [];

  // Split market into bets
  for (const market of filterMarkets(markets)) {
    for (const price of market.prices) {
      const bet: Bet = Object.assign({}, market, { price, prices: undefined });
      bets.push(bet);
    };
  }

  return (bets);
}

async function getLeagueMatches(leagueId: Id): Promise<Match[]> {
  const matches = (await axios.get(`${API_HOST}/leagues/${leagueId}/matchups`, DEFAULT_REQUEST_CONFIG)).data;
  return filterMatches(matches);
}

function filterMatches(matches: Match[]): Match[] {
  return matches.filter((match: Match) => {
    return moment(match.startTime).isBetween(moment.now(), moment().add(12, 'hours'))
  });
}

function filterMarkets(markets: Market[]): Market[] {
  return markets.filter(market => {
    return market.type === "total" && market.period === 0
  });
}

function normalizeBets(bets: Bet[]): Bettable[] {
  return bets.map((bet) => {
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
    };
  });
}

/**
 * Gets all bets available from all matches of all football leagues
 */
async function retriveBets(): Promise<Bet[]> {
  const leagues: League[] = await getSportLeagues(FOOTBALL_ID);
  let allBets: Bet[] = [];

  for(const league of leagues) {
    const matches: Match[] = await getLeagueMatches(league.id);

    // Get all leagues matches in parallel
    const leagueBets: Bet[][] = await Promise.all(matches.map((match): Promise<Bet[]> => {
      return new Promise(async (resolve): Promise<void> => {
        const matchBets = await getMatchBets(match.id);

        // Add match data to bets
        matchBets.map(bet => { return Object.assign(bet, { match }); });

        resolve(matchBets);
      });
    }));
    allBets = allBets.concat(leagueBets.flat());
  }
  return allBets;
}

export default async function retriveBetsAndUpdateDb(): Promise<void> {
  const bets = await retriveBets();
  const bettables = normalizeBets(bets);

  for (const bettable of bettables) {
    await saveBettable(bettable);
  }
}



