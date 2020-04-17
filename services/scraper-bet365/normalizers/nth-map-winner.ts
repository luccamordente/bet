import { SimpleWinnerData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectMapPeriod, detectHomeAway } from "./common";

function normalize(normalizable: { data: SimpleWinnerData }): NormalizeResult {
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
            value: detectHomeAway(data, market.value.name),
            unit: "team",
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
