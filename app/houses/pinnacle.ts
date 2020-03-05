import axios from 'axios';
import moment from 'moment';

interface Array<T> {
    flat(): Array<T>;
    flatMap(func: (x: T) => T): Array<T>;
}

const DEFAULT_REQUEST_CONFIG = {
    headers: {"accept":"application/json","content-type":"application/json","x-api-key":"CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R","x-device-uuid":"995eb6f3-65211f6e-e22c04e9-42a211b8", referrer: "https://www.pinnacle.com/en/soccer/leagues/","referrerPolicy":"no-referrer-when-downgrade",},
    withCredentials: false,
  }

const API_HOST = "https://guest.api.arcadia.pinnacle.com/0.1"

async function getAllLeagues() {
  const response = await axios.get(`${API_HOST}/sports/29/leagues?all=false`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

async function getMatchBets(matchId) {
  const response = await axios.get(`${API_HOST}/matchups/${matchId}/markets/related/straight`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

async function getLeagueMatches(leagueId) {
  const response = await axios.get(`${API_HOST}/leagues/${leagueId}/matchups`, DEFAULT_REQUEST_CONFIG);
  return response.data;
}

function filterMatches(matches) {
  return matches.filter(match => {
    return moment(match.startTime).isBetween(moment.now(), moment().add(12, 'hours'))
  });
}

function filterBets(bets) {
  return bets.filter(bet => {
    return bet.type === "total" && bet.period === 0
  });
}

export default async function retriveBetsAndUpdateDb() {
  const originalBets = await retriveBets();
  const normalizedBets = normalizeBets(originalBets);
  saveNormalizedBets(normalizedBets);

}

async function normalizeBets(bets) {
  return bets.map((bet) => {
    {

    }
  });
}

async function saveNormalizedBets(bets) {

}

async function retriveBets() {
  console.time('nois')
  const leagues = await getAllLeagues();
  let betArrays = [];
  for(let league of leagues) {
    const matches = filterMatches(await getLeagueMatches(league.id));
    const bets = await Promise.all(matches.map((match) => {
      return new Promise(async (resolve, reject) => {
        const bets = await getMatchBets(match.id);
        const augmentedBets = bets.map(bet => {
          return Object.assign(bet, { match });
        });
        resolve(filterBets(augmentedBets));
      })
    }));
    
    betArrays.push(bets.flat());
  }
  console.log(betArrays.flat());
  return betArrays.flat();
}



