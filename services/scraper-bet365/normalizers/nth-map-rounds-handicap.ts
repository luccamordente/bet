import { CompleteHandicapData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectMapPeriod, detectHomeAway } from "./common";

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
            kind: "handicap",
            operation: "spread",
            team: null,
            value: [
              detectHomeAway(data, market.header),
              parseFloat(market.value.handicap),
            ],
            unit: "rounds",
            period: detectMapPeriod(data.marketGroup),
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
