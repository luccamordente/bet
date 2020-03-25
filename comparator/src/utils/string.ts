import { Stakeable } from "../models/opportunity";
import moment from "moment";
import { Bettable, BettableMarket } from "../models/bettable";

const SPORTS = {
  basketball: "🏀 Basketball",
  esports: "🎮 E-Sports",
  hockey: "🏒 Hockey",
  soccer: "⚽️ Soccer",
  tabletennis: "🏓 Table Tennis",
  tennis: "🎾 Tennis"
} as const;

export function oddToString(odd: number): string {
  return `${Math.round(odd * 100) / 100}`;
}

export function profitToString(amount: number): string {
  const percent = `${(amount * 100).toFixed(2)}%`;
  return `${amount > 0 ? "🍀" : "🔻"} ${percent}`;
}

export function sportToString(sport: string): string {
  if (sport in SPORTS) {
    return SPORTS[sport as keyof typeof SPORTS];
  }
  throw new TypeError(`Invalid sport '${sport}'`);
}

export function houseToString(house: string) {
  const capitalized = house.charAt(0).toUpperCase() + house.slice(1);
  return capitalized;
}

export function startDateToString(startDate: Date) {
  return `${moment(startDate).format(
    "DD/MMM hh:mm"
  )}`;
}

export function comparableToString(comparable: Bettable) {
  const {
    odd,
    house,
    market: { operation },
    event: { starts_at, participants }
  } = comparable;
  return ` 🏦 ${houseToString(house)} (${operation.operator} ${
    operation.value
  } ⇢ ${oddToString(odd)}) 🗓  ${startDateToString(starts_at)} 🎭 ${participantsToString(participants)}`;
}

export function participantsToString(participants: { home: string, away: string }) {
  const { home, away } = participants;
  return `${home} × ${away}`;
}

export function marketToString(market: BettableMarket, sport: string) {
  switch (market.key) {
    case "game_score_total":
      switch (sport) {
        case "basketball":
        case "tabletennis":
        case "tennis":
          return "Total de pontos no jogo";
        case "esports":
          return "Total de mapas no jogo";
        case "hockey":
        case "soccer":
          return "Total de gols no jogo";
      }
      break;
    case "game_score_handicap":
      switch (sport) {
        case "basketball":
        case "tabletennis":
        case "tennis":
          return "Handicap de pontos no jogo";
        case "esports":
          return "Handicap de mapas no jogo";
        case "hockey":
        case "soccer":
          return "Handicap de gols no jogo";
      }
      break;
  }
  return market.key;
}

export function bettableToString(stakeable: Stakeable) {
  const {
    house,
    stake,
    odd,
    market: { key, operation },
    extracted_at,
    url,
    event: { starts_at, participants }
  } = stakeable;
  return `🏦 ${houseToString(house)} 🗓  ${startDateToString(starts_at)} 🎭 ${participantsToString(participants)}
  ✨ ${key.replace("_", " ")}: ${operation.operator} ${
    operation.value
  } ⇢ ${oddToString(odd)}
  💰 Stake: ${(stake * 100).toFixed(1)}%
  🕓 ${moment(extracted_at).fromNow()}
  🔗 ${url}`;
}

export function bettableToTelegramString(stakeable: Stakeable) {
  const {
    house,
    stake,
    odd,
    market: { key, operation },
    url,
  } = stakeable;
  return `🏦 ${houseToString(house)}\n` +
  `  🛒 ${key.replace("_", " ")}: ${operation.operator} ${
    operation.value
  }\n`+
  `  ⚖️ Odd: ${oddToString(odd)}\n` +
  `  💰Stake: ${(stake * 100).toFixed(1)}%\n` +
  `  🔗 ${url}`;
}
