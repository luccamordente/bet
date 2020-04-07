import { GenericMarket } from "./generic";

type Team = "home" | "away" | "both";

export interface Handicap extends GenericMarket {
  readonly kind: "handicap";
  readonly operation: "spread";
  readonly team: null;
  readonly value: readonly ["home" | "away", number];
}

export interface Total extends GenericMarket {
  readonly kind: "total";
  readonly operation: "over_under";
  readonly team: Team;
  readonly value: readonly ["over" | "under", number];
}

export interface OddEven extends GenericMarket {
  readonly kind: "odd_even";
  readonly operation: "binary";
  readonly team: Team;
  readonly value: "odd" | "even";
}

export interface Result extends GenericMarket {
  readonly kind: "result";
  readonly operation: "binary";
  readonly team: null;
  readonly value: "home" | "away";
  readonly unit: "team";
}

export type Market = Handicap | Total | OddEven | Result;
