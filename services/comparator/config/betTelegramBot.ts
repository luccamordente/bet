import { createTelegramBotAPI } from "@bet/telegram-bot-api";
import { assertEnv } from "@bet/assert";

assertEnv(process.env, ["BET_TELEGRAM_BOT_TOKEN"]);

const betTelegramBot = createTelegramBotAPI(process.env.BET_TELEGRAM_BOT_TOKEN);

export default betTelegramBot;
