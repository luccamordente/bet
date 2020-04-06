import * as types from "./types";
import request from "./request";
import { assertEnv } from "@bet/assert";

assertEnv(process.env, ["EVENT_TIME_SPAN_HOURS"]);
const { EVENT_TIME_SPAN_HOURS } = process.env;

interface GetLeaguesParams {
  sportId: number;
}

export async function getLeagues(params: GetLeaguesParams) {
  return request<types.League[]>(
    `https://api.arcadia.pinnacle.com/0.1/sports/${params.sportId}/leagues?all=false`
  );
}

interface GetMatchupsParams {
  leagueId: number;
}

export async function getMatchups(params: GetMatchupsParams) {
  const matchups = await request<types.Matchup[]>(
    `https://api.arcadia.pinnacle.com/0.1/leagues/${params.leagueId}/matchups`
  );
  return matchups.filter((matchup) => new Date(matchup.startTime).getTime() - new Date().getTime() < parseInt(EVENT_TIME_SPAN_HOURS) * 60 * 60 * 1000);
}

interface GetMarketsParams {
  matchId: number;
}

/**
 * Get markets filtering only the ones that are directly related to the current matchup.
 * Ones that are not directly related, will be related to the matchup children,
 * which are also retrieved in matchups endpoint.
 */
export async function getMarkets(params: GetMarketsParams) {
  const markets = await request<types.Market[]>(
    `https://api.arcadia.pinnacle.com/0.1/matchups/${params.matchId}/markets/related/straight`
  );
  return markets.filter((market) => market.matchupId === params.matchId);
}
