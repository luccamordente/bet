import { MarketContext } from "./types";
import { NormalizeResult } from "../../packages/types";

import * as normalizers from "./normalizers";

function classify(context: MarketContext) {
  const { market, matchup } = context;
  if (
    matchup.units === "Regular" &&
    matchup.type === "matchup" &&
    matchup.parentId === null
  ) {
    if (market.type === "spread") {
      return { kind: "regular_handicap", market, matchup } as const;
    }
  } else {
  }
  return { kind: "total", market, matchup } as const;
}

export default function normalize(context: MarketContext): NormalizeResult {
  const classified = classify(context);

  switch (classified.kind) {
    case "regular_handicap":
      return normalizers.regularHandicap(classified);

    default:
      return {
        ok: false,
        message: "Unnormalizable market context!",
        data: { context },
      };
  }
}
