import * as types from "./types";
import request from "./request";

interface GetLeaguesParams {
  sportId: number;
}

export async function getLeagues(params: GetLeaguesParams) {
  return request<types.League[]>(
    `https://guest.api.arcadia.pinnacle.com/0.1/sports/${params.sportId}/leagues?all=false`
  );
}

interface GetMatchupsParams {
  leagueId: number;
}

export async function getMatchups(params: GetMatchupsParams) {
  return request<types.Matchup[]>(
    `https://guest.api.arcadia.pinnacle.com/0.1/leagues/${params.leagueId}/matchups`
  );
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
    `https://guest.api.arcadia.pinnacle.com/0.1/matchups/${params.matchId}/markets/related/straight`
  );
  return markets.filter((market) => market.matchupId === params.matchId);
}
