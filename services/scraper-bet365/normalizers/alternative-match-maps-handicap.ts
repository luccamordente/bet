import { HeaderOnlyData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectHomeAway } from "./common";

function normalize(normalizable: {
  data: HeaderOnlyData;
}): NormalizeResult {
  const { data } = normalizable;
  const { market } = data;

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
            parseFloat(market.value.name),
          ],
          unit: "maps",
          period: "match",
        },
      },
    ],
  };
}

export default normalize;
