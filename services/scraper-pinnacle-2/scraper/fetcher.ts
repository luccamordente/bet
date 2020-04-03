import { getLeagues, getMatches, getBets } from "../pinnacle-api";

import { Sport, SPORTS } from "./sports";

import * as types from "../types";

export interface Config {
  time: number;
}

type Listener = (bettable: types.Bet) => any;

function run(config: Config, emit: Listener): void {
  
  async function handleBet(bet: types.Bet) {
    emit(bet);
  }
  
  async function handleMatch(match: types.Match) {
    const bets = await getBets({ matchId: match.id });
    console.log('Requested bets', JSON.stringify(bets, null, "\t"));
    for (const bet of bets) {
      await handleBet({ ...bet, match });
    }
  }
  
  async function handleLeague(league: types.League) {
    const matches = await getMatches({ leagueId: league.id });
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
