import { GenericBettable } from "../generic";
import * as markets from "../markets";

interface ResultMarket {
  readonly period: "match";
}

export default interface TableTennisBettable extends GenericBettable {
  readonly sport: "table_tennis";
  readonly market: markets.Result & ResultMarket;
}
