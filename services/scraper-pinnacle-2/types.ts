import * as pinnacle from "./pinnacle-api/types";

export type League = pinnacle.League;

export type Match = pinnacle.Match & {
  league: pinnacle.League;
};

export type Bet = pinnacle.Bet & {
  match: Match;
};
