import fetcher, { Config } from "./fetcher";
import normalize from "../normalizer";
import { Bet } from "../types";

type Listener = (bettable: Bettable) => any;
let emit: Listener;

function handle(bet: Bet) {
  const normalization = normalize(bet);
  
  if (normalization.status === "ok") {
    emit(normalization.object);
  } else {
    console.info(`Unnormalizable bet ${JSON.stringify(bet)}`);
  }
}

function run(config: Config, listener: Listener): void {
  emit = listener;
  fetcher.run(config, handle);
}

export default { run };
