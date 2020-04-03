import * as pinnacle from "./pinnacle-api/types";

export interface League extends pinnacle.League {};

export interface Match extends pinnacle.Match {};

export interface Bet extends pinnacle.Bet {
  match: Match;
};
