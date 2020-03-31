import Axios from 'axios';
import moment from 'moment';

import { americanToDecimal } from '../utils/odds';

import { save as saveBettable, Bettable, BettableMarket, MarketKey } from '../models/bettable';

const axios = Axios.create({
  baseURL: 'https://guest.api.arcadia.pinnacle.com/0.1',
  headers: {"accept":"application/json","content-type":"application/json","x-api-key":"CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R","x-device-uuid":"995eb6f3-65211f6e-e22c04e9-42a211b8", referrer: "https://www.pinnacle.com/en/soccer/leagues/","referrerPolicy":"no-referrer-when-downgrade",},
  withCredentials: false,
  timeout: 10000,
});

const SPORTS: { key: string, id: number }[] = [
  { key: 'basketball', id: 4, },
  { key: 'esports', id: 12, },
  { key: 'soccer', id: 29, },
  { key: 'hockey', id: 19, },
  // { key: 'tabletennis', id: 32, },
  // { key: 'tennis', id: 33, },
];
const TIME_SPAN_HOURS: number = 24;

const NORMALIZED_MARKET_KEY: { [key:string]: MarketKey } = {
  's;0;ou;': 'game_score_total',   // score; on game; over/under
  's;0;s;': 'game_score_handicap', // score; on game; spread (handicap)
}

const ALLOWED_MARKETS = Object.keys(NORMALIZED_MARKET_KEY);

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
  readonly designation: string,
  readonly points: number,
  readonly price: number,
};

interface Bet {
  readonly sport: string,
  readonly type: BetType,
  readonly period: BetPeriod,
  readonly match: Match,
  readonly price: BetPrice,
  readonly extractTime: Date,
  readonly key: string,
  readonly matchupId: number,
};

interface Market {
  readonly sport: string,
  readonly type: BetType,
  readonly period: BetPeriod,
  readonly match: Match,
  readonly prices: BetPrice[],
  readonly key: string,
  readonly matchupId: number,
};


async function getSportLeagues(sportId: Id): Promise<League[]> {
  let leagues: League[];
  try {
    leagues = (await axios.get(`/sports/${sportId}/leagues?all=false`)).data;
  } catch (error) {
    console.error(`Error getting sport leagues from sport ${sportId}`, error);
    return [];
  }
  return leagues;
}

async function* getMatchBets(matchId: Id) {
  let markets: Market[];
  let extractTime;
  try {
    markets = (await axios.get(`/matchups/${matchId}/markets/related/straight`)).data;
    extractTime = new Date();
  } catch (error) {
    console.error(`Error getting match bets from match ${matchId}`, error);
    return [];
  }

  const filteredMarkets = filterMarkets(markets, (market) => {
    // The market should have the same matchupId of the market match,
    // which means that it's not an alternate market like corners.
    // When support is added for additional markets, this needs to be
    // cross referenced with a different API endpoint.
    return market.matchupId === matchId;
  });

  // Split market into bets
  for (const market of filteredMarkets) {
    for (const price of market.prices) {
      const bet: Bet = Object.assign(
        {
          key: market.key,
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
    matches = (await axios.get(`/leagues/${leagueId}/matchups`)).data;
  } catch (error) {
    console.error(`Error getting league matches from league ${leagueId}`, error);
    return [];
  }
  return filterMatches(matches);
}

function filterMatches(matches: Match[]): Match[] {
  return matches.filter((match: Match) => {
    return moment(match.startTime).isBetween(moment.now(), moment().add(TIME_SPAN_HOURS, 'hours'))
    && match.type === "matchup"
    && match.units === "Regular";
  });
}

/**
 * Allows a market if the market key includes one of the allowed market keys
 * defined on ALLOWED_MARKETS, plus matches the conditions of the extraFilter function.
 */
function filterMarkets(markets: Market[], extraFilter: (market: Market) => boolean): Market[] {
  return markets.filter(market => {
    return ALLOWED_MARKETS.some(allowed => {
      return market.key.includes(allowed);
    }) && extraFilter(market);
  });
}

function normalizeMarket(bet: Bet): BettableMarket {
  const key = NORMALIZED_MARKET_KEY[bet.key.match(/(.*;)/)[1]];

  switch (key) {
    case 'game_score_total':
      return {
        key,
        type: 'over_under',
        operation: {
          operator: bet.price.designation as 'over' | 'under',
          value: bet.price.points,
        }
      }
    case 'game_score_handicap':
      return {
        key,
        type: 'spread',
        operation: {
          operator: bet.price.designation as 'home' | 'away',
          value: bet.price.points,
        }
      }
    default:
      throw new Error(`Market key '${key}' not found!`);
  }
}

function normalizeBet(bet: Bet): Bettable {
  return {
    odd: americanToDecimal(bet.price.price),
    market: normalizeMarket(bet),
    house: "pinnacle",
    sport: bet.sport,
    event: {
      league: bet.match.league.name,
      starts_at: new Date(bet.match.startTime),
      participants: {
        home: bet.match.participants[0].name,
        away: bet.match.participants[1].name,
      },
    },
    extracted_at: bet.extractTime,
    url: `https://www.pinnacle.com/pt/${bet.sport}/a/b/${bet.match.id}/`,
  };
}

/**
 * Gets all bets available from all matches of all football leagues
 */
async function* retriveBets() {
  for (const {id: sportId, key: sportKey} of SPORTS) {
    const leagues: League[] = await getSportLeagues(sportId);

    for(const league of leagues) {
      // console.log(`Pinnacle: Processing league ${league.id}`);
      const matches: Match[] = await getLeagueMatches(league.id);

      for (const match of matches) {
        // console.log(`Pinnacle: Processing match ${match.id} on league ${match.league.id}`);

        for await (const bet of getMatchBets(match.id)) {
          // console.log(`Pinnacle: Processing bet ${americanToDecimal(bet.price.price)} on match ${match.id}`);
          yield Object.assign(bet, { match, sport: sportKey });
        }
      }
    }
  }

  return;
}

// function validate() {
//   for (const allowedMarket of ALLOWED_MARKETS) {
//     const normalizedMarket = MARKET_NORMALIZATION[allowedMarket];
//     if (normalizedMarket === undefined) {
//       throw new Error(`Market '${allowedMarket}' is not normalized!`);
//     }
//   }
// }

function logBettable(bettable: Bettable) {
  const {
    sport,
    market,
    odd,
    event: {
      starts_at,
      participants
    },
    url,
  } = bettable;

  console.log(
    `💾 Pinnacle ${sport} ${market.key}` +
    ` (${market.operation.operator} ${market.operation.value} ⇢ ${Math.round(odd*100)/100})` +
    ` ${starts_at.toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        year: undefined,
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZoneName: "short"
      })}` +
    ` ${participants.home} × ${participants.away}` +
    ` ${url}`
  );
}

export default async function retriveBetsAndUpdateDb(): Promise<number> {
  // validate();

  let savedCount = 0;

  for await (const bet of retriveBets()) {
    const bettable = normalizeBet(bet);
    logBettable(bettable)
    saveBettable(bettable);
    savedCount++;
  }

  return savedCount;
}



