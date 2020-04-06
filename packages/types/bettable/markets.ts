type Team = "home" | "away" | "both";

export interface Handicap {
  readonly kind: "handicap";
  readonly operation: "spread";
  readonly team: undefined;
  readonly value: readonly ["home" | "away", number];
}

export interface Total {
  readonly kind: "total";
  readonly operation: "over_under";
  readonly team: undefined;
  readonly value: readonly ["over" | "under", number];
}

export interface TeamTotal {
  readonly kind: "team_total";
  readonly operation: "over_under";
  readonly team: Team;
  readonly value: readonly ["over" | "under", number];
}

export interface OddEven {
  readonly kind: "odd_even";
  readonly operation: "binary";
  readonly team: Team;
  readonly value: "odd" | "even";
}

export interface Result {
  readonly kind: "result";
  readonly operation: "binary";
  readonly team: undefined;
  readonly value: "home" | "away";
  readonly unit: "team";
}
