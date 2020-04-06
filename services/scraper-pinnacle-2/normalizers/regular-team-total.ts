import { NormalizeResult, NewSoccerBettable } from "@bet/types";
import { RootMatchup, TeamTotalMarket } from "../pinnacle-api/types";
import { commonBettable } from "./utils";

interface RegularTotalContext {
  readonly market: TeamTotalMarket;
  readonly matchup: RootMatchup;
}

export default function regularTeamTotal(
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
    // We couldn't find any markets that match the conditions for E-Sports yet
    return {
      ok: false,
      code: "sport_not_supported",
      message:
        "If you're seeing this error, it means that we thought there were no markets that match this condition. You may want to implement this market now.",
      data: { ctx },
    };
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
  market: TeamTotalMarket,
  price: Price
): NewSoccerBettable {
  return {
    ...commonBettable(matchup, price),
    sport: "soccer",
    market: {
      kind: "team_total",
      operation: "over_under",
      period: market.period === 0 ? "match" : ["half", market.period],
      team: market.side,
      unit: "goals", // regular totals are only for goals
      value: [price.designation, price.points],
    },
  };
}
