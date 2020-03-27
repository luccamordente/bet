import { Stakeable } from "../models/opportunity";
import moment from "moment";
import { Bettable, BettableMarket } from "../models/bettable";

const SPORTS = {
  basketball: "🏀 Basquete",
  esports: "🎮 E-Sports",
  hockey: "🏒 Hockey",
  soccer: "⚽️ Futebol",
  tabletennis: "🏓 Tênis de Mesa",
  tennis: "🎾 Tênis"
} as const;

export function oddToString(odd: number): string {
  return `${Math.round(odd * 100) / 100}`;
}

function decimalToPercent(amount: number, digits: number = 0) {
  return `${(amount * 100).toFixed(digits)}%`
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
  return new Date(date)
    .toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      year: undefined,
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
}

export function startDateToString(startDate: Date) {
  return `${dateToString(startDate)}`;
}

export function comparableToString(comparable: Bettable) {
  const {
    odd,
    house,
    market: { operation },
    event: { starts_at,
      participants }
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

function marketOperationToString(bettable: Bettable): string {
  const {
    market: { operation },
    event: { participants },
  } = bettable;

  let operator: string;
  switch (operation.operator) {
    case 'home':
      operator = participants.home
      break;
    case 'away':
      operator = participants.away
      break;
    case 'over':
      operator = 'Over ↑'
      break;
    case 'under':
      operator = 'Under ↓'
      break;
  }

  return `${operator} ${operation.value}`;
}

export function bettableToString(stakeable: Stakeable) {
  const {
    sport,
    house,
    stake,
    odd,
    market,
    extracted_at,
    url,
    event: { starts_at, participants }
  } = stakeable;
  return `🏦 ${houseToString(house)} 🗓  ${startDateToString(starts_at)} 🎭 ${participantsToString(participants)}
  🛒 ${marketToString(market, sport)}: ${marketOperationToString(stakeable)} ⇢ ${oddToString(odd)}
  💰 Stake: ${(stake * 100).toFixed(1)}%
  🕓 ${moment(extracted_at).fromNow()}
  🔗 ${url}`;
}

export function telegramEscape(text: string): string {
  const chars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  const regexp = new RegExp(`([${chars.map(c => `\\${c}`).join('')}])`, 'g');
  return text.replace(regexp, '\\$1');
}

export function profitToTelegramString(amount: number): string {
  return `🍀 __*${telegramEscape(`Oportunidade! ${decimalToPercent(amount, 2)}`)}*__`;
}

export function bettableToTelegramString(stakeable: Stakeable) {
  const {
    sport,
    house,
    stake,
    odd,
    market,
    url,
  } = stakeable;
  return `🏦 __${telegramEscape(houseToString(house))}__\n` +
  telegramEscape(`   🛒 ${marketToString(market, sport)}: ${marketOperationToString(stakeable)}\n`)+
  telegramEscape(`   ⚖️ Odd: ${oddToString(odd)}\n` )+
  telegramEscape(`   💰Stake: ${(stake * 100).toFixed(1)}%\n` )+
  telegramEscape(`   🔗 ${url}`);
}