import {
  NormalizeResult,
  NewSoccerBettable,
  NewEsportsBettable,
} from "@bet/types";
import { RootMatchup, TotalMarket } from "../pinnacle-api/types";
import { commonBettable } from "./utils";

interface RegularTotalContext {
  readonly market: TotalMarket;
  readonly matchup: RootMatchup;
}

export default function regularTotal(
  ctx: RegularTotalContext
): NormalizeResult {
  const { market, matchup } = ctx;
  let bettableA;
  let bettableB;

  if (matchup.league.sport.id === 29) {
    // soccer
    bettableA = soccerBettable(matchup, market, market.prices[0]);
    bettableB = soccerBettable(matchup, market, market.prices[1]);
  } else if (matchup.league.sport.id === 12) {
    // esports
    bettableA = esportsBettable(matchup, market, market.prices[0]);
    bettableB = esportsBettable(matchup, market, market.prices[1]);
  } else {
    const { sport } = matchup.league;
    return {
      ok: false,
      code: "sport_not_supported",
      message: `Sport '${sport.name}' (${sport.id}) is not supported`,
      data: { ctx },
    };
  }

  return {
    ok: true,
    bettables: [bettableA, bettableB],
  };
}

interface Price {
  readonly designation: "over" | "under";
  readonly points: number;
  readonly price: number;
}

function soccerBettable(
  matchup: RootMatchup,
  market: TotalMarket,
  price: Price
): NewSoccerBettable {
  return {
    ...commonBettable(matchup, price),
    sport: "soccer",
    market: {
      kind: "total",
      operation: "over_under",
      period: market.period === 0 ? "match" : ["half", market.period],
      team: undefined,
      unit: "goals", // regular totals are only for goals
      value: [price.designation, price.points],
    },
  };
}

function esportsBettable(
  matchup: RootMatchup,
  market: TotalMarket,
  price: Price
): NewEsportsBettable {
  if (market.period === 0) {
    return {
      ...commonBettable(matchup, price),
      sport: "esports",
      market: {
        kind: "total",
        operation: "over_under",
        period: "match",
        team: undefined,
        unit: "maps",
        value: [price.designation, price.points],
      },
    };
  } else {
    return {
      ...commonBettable(matchup, price),
      sport: "esports",
      market: {
        kind: "total",
        operation: "over_under",
        period: ["map", market.period],
        team: undefined,
        unit: "rounds",
        value: [price.designation, price.points],
      },
    };
  }
}
