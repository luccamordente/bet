import { GenericBettable } from "../generic";
import * as markets from "../markets";

type Map = readonly ["map", number];

interface RoundsMarket {
  readonly period: Map | "match";
  readonly unit: "rounds";
}

interface MapsMarket {
  readonly period: "match";
  readonly unit: "maps";
}

interface ResultMarket {
  readonly period: Map | "match";
}

export default interface EsportsBettable extends GenericBettable {
  readonly sport: "esports";
  readonly market:
    | (markets.Handicap & MapsMarket)
    | (markets.Handicap & RoundsMarket)
    | (markets.OddEven & MapsMarket)
    | (markets.OddEven & RoundsMarket)
    | (markets.Total & MapsMarket)
    | (markets.Total & RoundsMarket)
    | (markets.Result & ResultMarket);
}
