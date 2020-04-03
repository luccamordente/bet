import fetcher, { Config } from "./fetcher";
import { Bet } from "../types";
import { Bettable } from "@bet/types";
import normalize from "../normalize";

type Listener = (bettable: Bettable) => void;

/**
 * Runs the fetcher and pipes all denormalized bets to be processed.
 * @param config Scraper configuration
 * @param emit A callback function that receives normalized bets
 */
function run(config: Config, emit: Listener): void {

  /**
   * Handles denormalized bets by classifying and normalizing them.
   * @param bet The bet to be normalized
   */
  function handle(bet: Bet) {
    const normalized = normalize(bet);
    
    if (normalized.ok) {
      emit(normalized.bettable);
    } else {
      console.error(normalized.message, normalized.data);
    }
  }
  
  fetcher.run(config, handle);
}

export default { run };
