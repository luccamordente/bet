import { NormalizeResult, Bettable } from "@bet/types";
import { MarketContext } from "../types";

export default function regularHandicap(
  context: MarketContext
): NormalizeResult {
  const bettable: Bettable = {
    odd: "",
    market: {
      kind: "",
      operation: "",
      period: "",
      team: "",
      unit: "",
    },
    house: "",
    sport: "",
    event: {
      league: "",
      starts_at: "",
      participants: {
        home: "",
        away: "",
      },
    },
    extracted_at: "",
    url: "",
  };

  return {
    ok: true,
    bettable,
  };

  return {
    ok: false,
    message: "Unknown error on total normalizer",
    data: { bet },
  };
}
