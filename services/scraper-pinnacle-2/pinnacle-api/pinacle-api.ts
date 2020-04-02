import * as types from "./types";
import { list } from "./request";

interface GetLeaguesParams {
  sportId: number;
}

export async function getLeagues(params: GetLeaguesParams) {
  return list<types.League>(`/sports/${params.sportId}/leagues?all=false`);
}

interface GetMatchesParams {
  leagueId: number;
}

export async function getMatches(params: GetMatchesParams) {
  return list<types.Match>(`/leagues/${params.leagueId}/matchups`);
}

interface GetBetsParams {
  matchId: number;
}

export async function getBets(params: GetBetsParams) {
  return list<types.Bet>(`/matchups/${params.matchId}/markets/related/straight`);
}
