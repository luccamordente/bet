import { assertEnv } from "./utils/assert";
import { Opportunity } from "./models/opportunity";
import betTelegramBot from "./config/betTelegramBot";
import { profitToString, sportToString, bettableToString } from "./utils/string";

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
    .catch(console.error);
}

function opportunityMessage(opportunity: Opportunity): string {
  const [b1, b2] = opportunity.stakeables;
  return (
    `${profitToString(
      opportunity.profit
    )} profit opportunity! 💰 ${sportToString(b1.sport)} 🛒 ${
      b1.market.key
    }\n` +
    `${bettableToString(b1)}\n` +
    `${bettableToString(b2)}`
  );
}
