import { Bet } from "./types";
import { NormalizeResult } from "../../packages/types";

import * as normalizers from "./normalizers";

function classify(bet: Bet) {
  return { kind: "total", bet } as const;
}

export default function normalize(bet: Bet): NormalizeResult {
  const classified = classify(bet);

  switch (classified.kind) {
    case "total":
      return normalizers.total(classified.bet);

    default:
      return {
        ok: false,
        message: "Unnormalizable bet!",
        data: { bet }
      };
  }
}
