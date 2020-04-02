import { getLeagues, getMatches, getBets } from "../pinnacle-api";
import * as types from "../types";

import { Sport, SPORTS } from "./sports";

export interface Config {
  time: number;
}

type Listener = (bettable: Bettable) => any;
let emit: Listener;

async function handleBet(bet: types.Bet) {
  emit("bet", bet);
}

async function handleMatch(match: types.Match) {
  const bets = await getBets({ matchId: match.id });
  for (const bet of bets) {
    await handleBet({...match, bet});
  }
}

async function handleLeague(league: types.League) {
  const matches = await getMatches({ leagueId: league.id });
  for (const match of matches) {
    await handleMatch({...match, league});
  }
}

async function handleSport(sport: Sport) {
  const leagues = await getLeagues({ sportId: sport.id });
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

function run(config: Config, listener: Listener): void {
  emit = listener;
  fetch();
}

function logError(error: unknown) {
  console.error("Error fetching data!");
  console.error(error);
}

export default { run };
