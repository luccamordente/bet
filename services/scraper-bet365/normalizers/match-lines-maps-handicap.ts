import { CompleteHandicapData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";
import { commonBettable } from "./common";

function normalize(normalizable: {
  data: CompleteHandicapData;
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
          kind: "handicap",
          operation: "spread",
          team: null,
          value: [
            market.header === data.eventParticipants[0] ? "home" : "away",
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
