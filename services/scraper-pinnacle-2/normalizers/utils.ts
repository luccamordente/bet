import { Matchup, RootMatchup } from "../pinnacle-api/types";

export function americanOddToDecimal(american: number): number {
  let ret: number;
  if (american < 0) {
    ret = 1 + -100 / american;
  } else {
    ret = 1 + american / 100;
  }
  return ret;
}

export function getPinnacleUrl(matchup: Matchup) {
  const leagueName = sanitize(matchup.league.name);

  const [home, away] = matchup.participants;
  const matchupName = sanitize(`${home.name}-vs-${away.name}`);

  return `https://www.pinnacle.com/pt/${matchup.league.sport.id}/${leagueName}/${matchupName}/${matchup.id}`;
}

function sanitize(str: string) {
  return str
    .trim()
    .toLowerCase()
    .replace(" ", "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function commonBettable(matchup: RootMatchup, price: { price: number }) {
  return {
    house: "pinnacle",
    extracted_at: new Date(),
    event: {
      league: matchup.league.name,
      participants: {
        home: matchup.participants[0].name,
        away: matchup.participants[1].name,
      },
      starts_at: new Date(matchup.startTime),
    },
    odd: americanOddToDecimal(price.price),
    url: getPinnacleUrl(matchup),
  };
}