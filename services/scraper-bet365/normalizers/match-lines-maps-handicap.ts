import { CompleteHandicapData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable, detectHomeAway } from "./common";

function normalize(normalizable: {
  data: CompleteHandicapData;
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
            parseFloat(market.value.handicap),
          ],
          unit: "maps",
          period: "match",
        },
      },
    ],
  };
}

export default normalize;
