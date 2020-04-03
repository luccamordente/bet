import { getLeagues, getMatchups, getMarkets } from "../pinnacle-api";

import { Sport, SPORTS } from "./sports";

import * as types from "../types";

export interface Config {
  time: number;
}

export type Listener = (event: types.MarketContext) => void;

function run(config: Config, emit: Listener): void {
  
  async function handleMatch(matchup: types.Matchup) {
    const markets = await getMarkets({ matchId: matchup.id });
    console.log('Requested markets', JSON.stringify(markets, null, "\t"));
    for (const market of markets) {
      emit({market, matchup});
    }
  }
  
  async function handleLeague(league: types.League) {
    const matches = await getMatchups({ leagueId: league.id });
    console.log('Requested matches', JSON.stringify(matches, null, "\t"));
    for (const match of matches) {
      await handleMatch(match);
    }
  }
  
  async function handleSport(sport: Sport) {
    const leagues = await getLeagues({ sportId: sport.id });
    console.log('Requested leagues', JSON.stringify(leagues, null, "\t"));
    for (const league of leagues) {
      await handleLeague(league);
    }
  }
  
  async function fetch() {
    // Loops infinitely over the sports
    for (let i = 0; (i = i % SPORTS.length) || true; i++) {
      const sport = SPORTS[i];
      await handleSport(sport);
    }
  }
  
  fetch();
}

function logError(error: unknown) {
  console.error("Error fetching data!");
  console.error(error);
}

export default { run };
