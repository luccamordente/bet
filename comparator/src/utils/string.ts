import { Stakeable } from "../models/opportunity";
import moment from "moment";
import { Bettable } from "../models/bettable";

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

export function comparableToString(comparable: Bettable) {
  const {
    odd,
    house,
    event: { participants, starts_at },
    market: { operation }
  } = comparable;
  return ` 🏦 ${house.toUpperCase()} (${operation.operator} ${
    operation.value
  } ⇢ ${oddToString(odd)} ) 🗓  ${moment(starts_at).format("DD/MMM hh:mm")} 🎭 ${
    participants.home
  } × ${participants.away}`;
}

export function bettableToString(stakeable: Stakeable) {
  const {
    stake,
    odd,
    house,
    market: { key, operation },
    extracted_at,
    url,
    event: { participants, starts_at }
  } = stakeable;
  return `🏦 ${house.toUpperCase()} 🗓  ${moment(starts_at).format(
    "DD/MMM hh:mm"
  )} 🎭 ${participants.home} × ${participants.away}
  ✨ ${key.replace("_", " ")}: ${operation.operator} ${
    operation.value
  } ⇢ ${oddToString(odd)}
  💰 Stake: ${(stake * 100).toFixed(1)}%
  🕓 ${moment(extracted_at).fromNow()}
  🔗 ${url}`;
}
