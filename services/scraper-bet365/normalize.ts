import { NormalizeResult } from "@bet/types";
import { Data } from "./scraper/types";

import * as normalizers from "./normalizers";

import {
  assertIsCompleteOddsOnlyData,
  assertIsHeaderOnlyData,
  assertIsCompleteHandicapData,
  assertIsSimpleWinnerData,
} from "./assertions";

function classify(data: Data) {
  const { marketGroup, market } = data;
  if (marketGroup == null || market == null) {
    return { kind: "unexpected", data } as const;
  }
  if (marketGroup === "Match Lines") {
    switch (market.label) {
      case "To Win":
        assertIsCompleteOddsOnlyData(data);
        return { kind: "match_lines_team_to_win", data } as const;
      case "Match Handicap":
        assertIsCompleteHandicapData(data);
        return { kind: "match_maps_handicap", data } as const;
      case "Total Maps":
        assertIsCompleteHandicapData(data);
        return { kind: "match_lines_total_maps", data } as const;
    }
  }
  if (marketGroup === "Alternative Match Handicap") {
    assertIsHeaderOnlyData(data);
    return { kind: "match_maps_handicap", data } as const;
  }
  if (marketGroup.match(/^Map \d+ - /) != null) {
    if (marketGroup.match(/- Winner$/) != null) {
      assertIsSimpleWinnerData(data);
      return { kind: "nth_map_winner", data } as const;
    }
    if (marketGroup.match(/- Rounds$/) != null) {
      switch (market.label) {
        case "Rounds Handicap":
          assertIsCompleteHandicapData(data);
          return { kind: "nth_map_rounds_handicap", data } as const;
        case "Total Rounds":
          assertIsCompleteHandicapData(data);
          return { kind: "nth_map_total_rounds", data } as const;
      }
    }
  }
  return { kind: "unknown", data } as const;
}
function normalize(data: Data): NormalizeResult {
  const classified = classify(data);
  switch (classified.kind) {
    case "match_lines_team_to_win":
      return normalizers.matchLinesTeamToWin(classified);
    case "match_maps_handicap":
      return normalizers.matchMapsHandicap(classified);
    case "match_lines_total_maps":
      return normalizers.matchLinesTotalMaps(classified);
    case "nth_map_winner":
      return normalizers.nthMapWinner(classified);
    case "nth_map_rounds_handicap":
      return normalizers.nthMapRoundsHandicap(classified);
    case "nth_map_total_rounds":
      return normalizers.nthMapTotalRounds(classified);
    case "unknown":
      return {
        ok: false,
        code: "not_classified",
        message: "Don't know how to classify data.",
        data: classified,
      };
    case "unexpected":
      return {
        ok: false,
        code: "unknown",
        message: "An unexpected error occurred.",
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

export default normalize;
