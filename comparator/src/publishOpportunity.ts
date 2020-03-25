import { assertEnv } from "./utils/assert";
import { Opportunity } from "./models/opportunity";
import betTelegramBot from "./config/betTelegramBot";
import { profitToString, bettableToTelegramString, participantsToString, startDateToString, houseToString } from "./utils/string";

assertEnv(process.env, ["TELEGRAM_OPPORTUNITY_CHAT_ID"]);

const { TELEGRAM_OPPORTUNITY_CHAT_ID } = process.env;

export default function publishOpportunity(opportunity: Opportunity) {
  betTelegramBot
    .sendMessage({
      params: {
        chat_id: TELEGRAM_OPPORTUNITY_CHAT_ID,
        text: opportunityMessage(opportunity)
      }
    })
    .then((resp => {
      if (!resp.ok) {
        logError(resp);
      }
    }))
    .catch(logError);
}

function opportunityMessage(opportunity: Opportunity): string {
  const [o1, o2] = opportunity.stakeables;
  const {
    event: { starts_at, participants },
    market: { key: market },
  } = o1;
  return (
    `${profitToString(opportunity.profit)}\n` +
    `🏦 ${houseToString(o1.house)} + ${houseToString(o2.house)}\n` +
    `🛒 ${market}\n\n`+
    `________________________\n\n`+
    `${bettableToTelegramString(o1)}\n\n` +
    `${bettableToTelegramString(o2)}\n\n` +
    `________________________\n\n`+
    `🎭 ${participantsToString(participants)}\n`+
    `🗓  ${startDateToString(starts_at)}`
  );
}

function logError(error: unknown) {
  console.error('Error publishing opportunity!');
  console.error(error);
}