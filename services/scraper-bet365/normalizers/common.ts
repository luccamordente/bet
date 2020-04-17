import { Data } from "../scraper/types";

export function commonBettable(data: Data) {
  return {
    odd: parseFloat(data.market.value.odds),
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
  } as const;
}

export function detectOverUnder(str: string): ["over" | "under", number] {
  const number = parseFloat(str.split(/\s+/)[1]);

  if (str.startsWith("O")) {
    return ["over", number];
  }
  if (str.startsWith("U")) {
    return ["under", number];
  }
  throw new Error(`Can't detect over or under designation on string "${str}".`);
}

export function detectMapPeriod(str: string): ["map", number] {
  const match = str.match(/Map (\d+)/);

  if (match == null || match[1] == null) {
    throw new Error(`Can't detect map on string "${str}".`);
  }

  return ["map", parseInt(match[1])];
}
