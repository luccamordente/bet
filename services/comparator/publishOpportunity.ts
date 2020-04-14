import { assertEnv } from "@bet/assert";
import { Opportunity } from "./models/opportunity";
import betTelegramBot from "./config/betTelegramBot";
import {
  bettableToTelegramString,
  participantsToString,
  startDateToString,
  houseToString,
  sportToString,
  profitToTelegramString,
  telegramEscape,
} from "./utils/string";
import { SendMessageParams } from "@bet/telegram-bot-api";

assertEnv(process.env, "TELEGRAM_OPPORTUNITY_CHAT_ID");

const { TELEGRAM_OPPORTUNITY_CHAT_ID } = process.env;

export default function publishOpportunity(
  opportunity: Opportunity,
  params?: SendMessageParams,
) {
  betTelegramBot
    .sendMessage({
      params: {
        chat_id: TELEGRAM_OPPORTUNITY_CHAT_ID,
        text: opportunityMessage(opportunity),
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
        ...params,
      },
    })
    .then((resp) => {
      if (!resp.ok) {
        logError(resp);
      }
    })
    .catch(logError);
}

export function opportunityMessage(opportunity: Opportunity): string {
  const [o1, o2] = opportunity.stakeables;
  const {
    event: { starts_at, participants },
    sport,
  } = o1;
  return (
    `${profitToTelegramString(opportunity.profit)}\n` +
    telegramEscape(
      `🏦 ${houseToString(o1.house)} + ${houseToString(o2.house)}\n\n`,
    ) +
    telegramEscape(`${sportToString(sport)}\n`) +
    telegramEscape(`🎭 ${participantsToString(participants)}\n`) +
    telegramEscape(`🗓  ${startDateToString(starts_at)}\n\n`) +
    `${bettableToTelegramString(o1)}\n\n` +
    `${bettableToTelegramString(o2)}\n`
  );
}

function logError(error: unknown) {
  console.error("Error publishing opportunity!");
  console.error(error);
}
