import { GenericBettable } from "../generic";
import * as markets from "../markets";

interface GoalsMarket {
  readonly period: readonly ["half", number] | "match";
  readonly unit: "goals";
}

export default interface SoccerBettable extends GenericBettable {
  readonly sport: "soccer";
  readonly market:
    | (markets.Handicap & GoalsMarket)
    | (markets.OddEven & GoalsMarket)
    | (markets.Total & GoalsMarket);
}
