import fetcher, { Listener as FetcherListener } from "./fetcher";
import { NewBettable } from "@bet/types";
import normalize from "../normalize";
import heart from "../heart";

type Listener = (bettable: NewBettable) => void;

/**
 * Runs the fetcher and pipes all denormalized bets to be processed.
 * @param emit A callback function that receives normalized bets
 */
function run(emit: Listener): void {
  /**
   * Handles denormalized markets by classifying and normalizing them.
   * @param event The market with it's matchup.
   */
  const handle: FetcherListener = (event) => {
    const normalized = normalize(event);

    if (normalized.ok) {
      normalized.bettables.forEach(emit);
      heart.beat();
    } else {
      console.error(normalized.message, JSON.stringify(normalized, null, 4));
    }
  };

  fetcher.run(handle);
}

export default { run };
