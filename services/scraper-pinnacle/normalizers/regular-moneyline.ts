import { NormalizeResult, NewEsportsBettable } from "@bet/types";
import { RootMatchup, RegularMoneylineMarket } from "../pinnacle-api/types";
import { commonBettable } from "./utils";

interface RegularMoneylineContext {
  readonly market: RegularMoneylineMarket;
  readonly matchup: RootMatchup;
}

export default function regularMoneyline(
  ctx: RegularMoneylineContext,
): NormalizeResult {
  const { market, matchup } = ctx;
  const { sport } = matchup.league;
  let bettableA;
  let bettableB;

  if (matchup.league.sport.id === 29) {
    // soccer
    return {
      ok: false,
      code: "sport_not_supported",
      message: `Sport '${sport.name}' (${sport.id}) is not supported because a draw can happen.`,
      data: { ctx },
    };
  } else if (matchup.league.sport.id === 12) {
    // esports
    bettableA = esportsBettable(matchup, market, market.prices[0]);
    bettableB = esportsBettable(matchup, market, market.prices[1]);
  } else {
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
  readonly price: number;
}

function esportsBettable(
  matchup: RootMatchup,
  market: RegularMoneylineMarket,
  price: Price,
): NewEsportsBettable {
  return {
    ...commonBettable(matchup, price),
    sport: "esports",
    market: {
      kind: "result",
      operation: "binary",
      period: market.period === 0 ? "match" : ["map", market.period],
      team: null,
      unit: "team",
      value: price.designation,
    },
  };
}
