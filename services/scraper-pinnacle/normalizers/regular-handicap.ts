import {
  NormalizeResult,
  NewSoccerBettable,
  NewEsportsBettable,
} from "@bet/types";
import { SpreadMarket, RootMatchup } from "../pinnacle-api/types";
import { commonBettable } from "./utils";

interface RegularHandicapContext {
  readonly market: SpreadMarket;
  readonly matchup: RootMatchup;
}

export default function regularHandicap(
  ctx: RegularHandicapContext,
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
  readonly designation: "home" | "away";
  readonly points: number;
  readonly price: number;
}

function soccerBettable(
  matchup: RootMatchup,
  market: SpreadMarket,
  price: Price,
): NewSoccerBettable {
  return {
    ...commonBettable(matchup, price),
    sport: "soccer",
    market: {
      kind: "handicap",
      operation: "spread",
      period: market.period === 0 ? "match" : ["half", market.period],
      team: undefined,
      unit: "goals", // regular handicaps are only for goals
      value: [price.designation, price.points],
    },
  };
}

function esportsBettable(
  matchup: RootMatchup,
  market: SpreadMarket,
  price: Price,
): NewEsportsBettable {
  return {
    ...commonBettable(matchup, price),
    sport: "esports",
    market: {
      kind: "handicap",
      operation: "spread",
      ...(market.period === 0
        ? { unit: "maps", period: "match" }
        : { unit: "rounds", period: ["map", market.period] }),
      team: undefined,
      value: [price.designation, price.points],
    },
  };
}
