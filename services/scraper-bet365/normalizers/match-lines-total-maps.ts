import { CompleteHandicapData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectOverUnder } from "./common";

function normalize(normalizable: {
  data: CompleteHandicapData;
}): NormalizeResult {
  const { data } = normalizable;
  const { market } = data;

  let overunder;
  try {
    overunder = detectOverUnder(market.value.handicap);
  } catch (err) {
    return {
      ok: false,
      code: "invalid_data",
      message: err.message,
      data: normalizable,
    };
  }

  return {
    ok: true,
    bettables: [
      {
        ...commonBettable(data),
        market: {
          kind: "total",
          operation: "over_under",
          team: "both",
          value: overunder as ReturnType<typeof detectOverUnder>,
          unit: "maps",
          period: "match",
        },
      },
    ],
  };
}

export default normalize;
