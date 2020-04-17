import { CompleteOddsOnlyData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable } from "./common";

function normalize(normalizable: {
  data: CompleteOddsOnlyData;
}): NormalizeResult {
  const { data } = normalizable;
  const { market } = data;

  if (!data.eventParticipants.includes(market.header)) {
    return {
      ok: false,
      code: "invalid_data",
      message: `Couldn't find '${market.header}' in the list of event participants.`,
      data: normalizable,
    };
  }

  return {
    ok: true,
    bettables: [
      {
        ...commonBettable(data),
        market: {
          kind: "result",
          operation: "binary",
          team: null,
          value: market.header === data.eventParticipants[0] ? "home" : "away",
          unit: "team",
          period: "match",
        },
      },
    ],
  };
}

export default normalize;
