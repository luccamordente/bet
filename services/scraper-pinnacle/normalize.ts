import { MarketContext } from "./types";
import { NormalizeResult } from "../../packages/types";

import * as normalizers from "./normalizers";
import { isRegularMoneylineMarket } from "./pinnacle-api/types";

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
    if (market.type === "total" || market.type === "team_total") {
      return { kind: "regular_total", market, matchup } as const;
    }
    if (market.type === "moneyline") {
      if (isRegularMoneylineMarket(market)) {
        return { kind: "regular_moneyline", market, matchup } as const;
      }
    }
  }
  return { kind: "unknown", market, matchup } as const;
}

export default function normalize(context: MarketContext): NormalizeResult {
  const classified = classify(context);

  switch (classified.kind) {
    case "regular_handicap":
      return normalizers.regularHandicap(classified);
    case "regular_total":
      return normalizers.regularTotal(classified);
    case "regular_moneyline":
      return normalizers.regularMoneyline(classified);

    case "unknown":
      return {
        ok: false,
        code: "not_classified",
        message: "Don't know how to classify market context.",
        data: classified,
      };

    default:
      return {
        ok: false,
        code: "no_normalizer",
        message: `No normalizer for this kind.`,
        data: classified,
      };
  }
}
