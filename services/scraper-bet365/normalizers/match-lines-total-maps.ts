import { CompleteHandicapData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectOverUnder } from "./common";

function normalize(normalizable: {
  data: CompleteHandicapData;
}): NormalizeResult {
  const { data } = normalizable;
  const { market } = data;

  try {
    return {
      ok: true,
      bettables: [
        {
          ...commonBettable(data),
          market: {
            kind: "total",
            operation: "over_under",
            team: "both",
            value: detectOverUnder(market.value.handicap),
            unit: "maps",
            period: "match",
          },
        },
      ],
    };
  } catch (err) {
    return {
      ok: false,
      code: "invalid_data",
      message: err.message,
      data: normalizable,
    };
  }
}

export default normalize;
