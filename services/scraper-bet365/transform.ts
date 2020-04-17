import { NewBettable } from "@bet/types";
import { Data } from "./scraper/types";

import normalize from "./normalize";

type Listener = (bettable: NewBettable) => void;

function transform(data: Data, emit: Listener): void {
  const normalized = normalize(data);

  if (normalized.ok) {
    normalized.bettables.forEach(emit);
  } else {
    console.error(normalized.message, JSON.stringify(normalized, null, 4));
  }
}

export default transform;
