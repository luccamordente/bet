type TeamScope = "home" | "away" | "both";

export interface HandicapMarket {
  type: "handicap";
  operation: "spread";
  scope: {
    period: unknown;
    team: undefined;
  };
  unit: unknown;
  value: ["home" | "away", number];
}

export interface TotalMarket {
  type: "total";
  operation: "over_under";
  value: ["over" | "under", number];
  scope: {
    period: unknown
    team: TeamScope;
  };
  unit: unknown;
}

export interface OddEvenMarket {
  type: "odd_even";
  operation: "binary";
  scope: {
    period: unknown;
    team: TeamScope;
  };
  unit: unknown;
  value: "odd" | "even";
}