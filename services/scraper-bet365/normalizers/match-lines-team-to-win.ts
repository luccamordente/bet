import { CompleteOddsOnlyData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectHomeAway } from "./common";

function normalize(normalizable: {
  data: CompleteOddsOnlyData;
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
            kind: "result",
            operation: "binary",
            team: null,
            value: detectHomeAway(data, market.header),
            unit: "team",
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
