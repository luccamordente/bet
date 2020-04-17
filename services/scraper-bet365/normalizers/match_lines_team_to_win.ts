import { CompleteOddsOnlyData } from "../scraper/types";
import { NormalizeResult } from "@bet/types";

export default function normalize(normalizable: {
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
        odd: parseFloat(data.market.value.odds),
        market: {
          kind: "result",
          operation: "binary",
          team: null,
          value: market.header === data.eventParticipants[0] ? "home" : "away",
          unit: "team",
          period: "match",
        },
        house: "bet365",
        sport: "esports",
        event: {
          league: data.leagueName,
          participants: {
            home: data.eventParticipants[0],
            away: data.eventParticipants[1],
          },
          starts_at: data.eventStartTime,
        },
        extracted_at: new Date(),
        url: data.url,
      },
    ],
  };
}
