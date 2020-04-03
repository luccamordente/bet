import fetcher, { Config, Listener as FetcherListener } from "./fetcher";
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
   * Handles denormalized markets by classifying and normalizing them.
   * @param event The market with it's matchup.
   */
  const handle: FetcherListener = (event) => {
    const normalized = normalize(event);
    
    if (normalized.ok) {
      normalized.bettables.forEach(emit);
    } else {
      console.error(normalized.message, normalized.data);
    }
  }
  
  fetcher.run(config, handle);
}

export default { run };
