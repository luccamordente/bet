import axios from 'axios';
import moment from 'moment';

const DEFAULT_REQUEST_CONFIG = {
    headers: {"accept":"application/json","content-type":"application/json","x-api-key":"CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R","x-device-uuid":"995eb6f3-65211f6e-e22c04e9-42a211b8", referrer: "https://www.pinnacle.com/en/soccer/leagues/","referrerPolicy":"no-referrer-when-downgrade",},
    withCredentials: false,
  }

const API_HOST = "https://guest.api.arcadia.pinnacle.com/0.1"

type League = { id: number };

type Match = {
  id: number,
  startTime: Date,
};

type Bet = {
  type: "total",
  period: 0 | 1 | 2,
  match: Match,
};

type NormalizedBet = {

};

async function getAllLeagues(): Promise<League[]> {
  const response = await axios.get(`${API_HOST}/sports/29/leagues?all=false`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

async function getMatchBets(matchId: Match["id"]): Promise<Bet[]> {
  const response = await axios.get(`${API_HOST}/matchups/${matchId}/markets/related/straight`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

async function getLeagueMatches(leagueId: League["id"]): Promise<Match[]> {
  const response = await axios.get(`${API_HOST}/leagues/${leagueId}/matchups`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

function filterMatches(matches: Match[]): Match[] {
  return matches.filter(match => {
    return moment(match.startTime).isBetween(moment.now(), moment().add(12, 'hours'))
  });
}

function filterBets(bets: Bet[]): Bet[] {
  return bets.filter(bet => {
    return bet.type === "total" && bet.period === 0
  });
}

export default async function retriveBetsAndUpdateDb(): Promise<void> {
  const originalBets = await retriveBets();
  const normalizedBets = normalizeBets(originalBets);
  saveNormalizedBets(normalizedBets);
}

function normalizeBets(bets: Bet[]): NormalizedBet[] {
  return bets.map((bet) => {
    return {};
  });
}

async function saveNormalizedBets(bets) {

}

async function retriveBets(): Promise<Bet[]> {
  const leagues: League[] = await getAllLeagues();
  let allBets: Bet[] = [];

  for(const league of leagues) {
    // Get and filter league matches
    const matches: Match[] = filterMatches(await getLeagueMatches(league.id));

    // Get all leagues matches in parallel
    const leagueBets: Bet[][] = await Promise.all(matches.map((match): Promise<Bet[]> => {
      return new Promise(async (resolve): Promise<void> => {
        // Get and filters match bets
        const matchBets = filterBets(await getMatchBets(match.id));

        // Add match data to bets
        const augmentedBets = matchBets.map(bet => {
          return Object.assign(bet, { match });
        });
        resolve(augmentedBets);
      });
    }));

    allBets = allBets.concat(leagueBets.flat());
  }
  return allBets;
}



