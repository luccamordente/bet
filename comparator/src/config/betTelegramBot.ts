import createTelegramBotAPI from "../telegram-bot-api/create";
import { assertEnv } from "../utils/assert";

assertEnv(process.env, ["BET_TELEGRAM_BOT_TOKEN"]);

const betTelegramBot = createTelegramBotAPI(process.env.BET_TELEGRAM_BOT_TOKEN);

export default betTelegramBot;
