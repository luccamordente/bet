import { NormalizeResult, Bettable } from "@bet/types";
import { Bet } from "../types";

export default function total(bet: Bet): NormalizeResult {
  const bettable: Bettable = {};

  return {
    ok: true,
    bettable
  };
  
  return {
    ok: false,
    message: "Unknown error on total normalizer",
    data: { bet }
  };
}
