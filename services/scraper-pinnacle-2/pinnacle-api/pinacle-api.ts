import * as types from "./types";
import { list } from "./request";

interface GetLeaguesParams {
  sportId: number;
}

export async function getLeagues(params: GetLeaguesParams) {
  return list<types.League>(`/sports/${params.sportId}/leagues?all=false`);
}

interface GetMatchupsParams {
  leagueId: number;
}

export async function getMatchups(params: GetMatchupsParams) {
  return list<types.Matchup>(`/leagues/${params.leagueId}/matchups`);
}

interface GetMarketsParams {
  matchId: number;
}

export async function getMarkets(params: GetMarketsParams) {
  return list<types.Market>(`/matchups/${params.matchId}/markets/related/straight`);
}
