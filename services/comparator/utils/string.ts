import { Stakeable } from "../models/opportunity";
import moment from "moment";
import { Bettable } from "@bet/types";

const SPORTS = {
  basketball: "🏀 Basquete",
  esports: "🎮 E-Sports",
  hockey: "🏒 Hockey",
  soccer: "⚽️ Futebol",
  tabletennis: "🏓 Tênis de Mesa",
  tennis: "🎾 Tênis",
} as const;

const OPERATORS = {
  over: "Over ↑",
  under: "Under ↓",
  odd: "Ímpar (odd)",
  even: "Par (even)",
};

export function oddToString(odd: number): string {
  return `${Math.round(odd * 100) / 100}`;
}

function decimalToPercent(amount: number, digits: number = 0) {
  return `${(amount * 100).toFixed(digits)}%`;
}

export function profitToString(amount: number): string {
  return `${amount > 0 ? "🍀" : "🔻"} ${decimalToPercent(amount, 2)}`;
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

function dateToString(date: Date): string {
  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: undefined,
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

export function startDateToString(startDate: Date) {
  return `${dateToString(startDate)}`;
}

export function comparableToString(comparable: Bettable) {
  const {
    odd,
    house,
    event: { starts_at, participants },
  } = comparable;
  return ` 🏦 ${houseToString(house)} (${marketOperationToString(
    comparable,
  )} (${oddToString(odd)})) 🗓  ${startDateToString(
    starts_at,
  )} 🎭 ${participantsToString(participants)}`;
}

export function participantsToString(participants: {
  home: string;
  away: string;
}) {
  const { home, away } = participants;
  return `${home} × ${away}`;
}

export function marketToString(bettable: Bettable) {
  const { market } = bettable;

  switch (market.kind) {
    case "total":
      return `Total de ${market.unit} em ${market.period}`;
    case "handicap":
      return `Handicap de ${market.unit} em ${market.period}`;
    case "odd_even":
      return `${market.unit} em ${market.period} (ímpar/par)`;
    case "result":
      return `Vencedor em ${market.period}`;
  }
}

function formatSpread(spread: number): string {
  return spread < 0 ? `${spread}` : `+${spread}`;
}

function marketOperationToString(bettable: Bettable): string {
  const {
    market,
    event: { participants },
  } = bettable;

  switch (market.operation) {
    case "spread":
      return `${participants[market.value[0]]}: ${formatSpread(
        market.value[1],
      )}`;

    case "over_under":
      return `${OPERATORS[market.value[0]]} ${market.value[1]}`;

    case "binary":
      switch (market.kind) {
        case "odd_even":
          return OPERATORS[market.value];
        case "result":
          return participants[market.value];
      }
  }
}

export function bettableToString(stakeable: Stakeable) {
  const {
    house,
    stake,
    odd,
    extracted_at,
    url,
    event: { starts_at, participants },
  } = stakeable;
  return `🏦 ${houseToString(house)} 🗓  ${startDateToString(
    starts_at,
  )} 🎭 ${participantsToString(participants)}
  🛒 ${marketToString(stakeable)}: ${marketOperationToString(
    stakeable,
  )} ⇢ ${oddToString(odd)}
  💰 Stake: ${(stake * 100).toFixed(1)}%
  🕓 ${moment(extracted_at).fromNow()}
  🔗 ${url}`;
}

export function telegramEscape(text: string): string {
  const chars = [
    "_",
    "*",
    "[",
    "]",
    "(",
    ")",
    "~",
    "`",
    ">",
    "#",
    "+",
    "-",
    "=",
    "|",
    "{",
    "}",
    ".",
    "!",
  ];
  const regexp = new RegExp(`([${chars.map((c) => `\\${c}`).join("")}])`, "g");
  return text.replace(regexp, "\\$1");
}

export function profitToTelegramString(amount: number): string {
  return `🍀 __*${telegramEscape(
    `Oportunidade! ${decimalToPercent(amount, 2)}`,
  )}*__`;
}

export function bettableToTelegramString(stakeable: Stakeable) {
  const { house, stake, odd, url } = stakeable;
  return (
    `🏦 __${telegramEscape(houseToString(house))}__\n` +
    telegramEscape(
      `   🛒 ${marketToString(stakeable)}: ${marketOperationToString(
        stakeable,
      )}\n`,
    ) +
    telegramEscape(`   ⚖️ Odd: ${oddToString(odd)}\n`) +
    telegramEscape(`   💰Stake: ${(stake * 100).toFixed(1)}%\n`) +
    telegramEscape(`   🔗 ${url}`)
  );
}
