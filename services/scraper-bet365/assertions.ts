import {
  GenericData,
  CompleteOddsOnlyData,
  HeaderOnlyData,
  CompleteHandicapData,
} from "./scraper/types";

export function assertIsCompleteOddsOnlyData(
  data: GenericData,
): asserts data is CompleteOddsOnlyData {
  const { market } = data;

  const asserted =
    market.header != null &&
    market.label != null &&
    market.value.handicap == null &&
    market.value.name == null;

  if (!asserted) {
    throw new Error("Not a Complete Odds Only Data: " + JSON.stringify(data));
  }
}

export function assertIsCompleteHandicapData(
  data: GenericData,
): asserts data is CompleteHandicapData {
  const { market } = data;

  const asserted =
    market.header != null &&
    market.label != null &&
    market.value.handicap != null &&
    market.value.name == null;

  if (!asserted) {
    throw new Error("Not a Complete Handicap Data: " + JSON.stringify(data));
  }
}

export function assertIsHeaderOnlyData(
  data: GenericData,
): asserts data is HeaderOnlyData {
  const { market } = data;

  const asserted =
    market.header != null &&
    market.label == null &&
    market.value.handicap == null &&
    market.value.name != null;

  if (!asserted) {
    throw new Error("Not a Header Only Data: " + JSON.stringify(data));
  }
}

export function assertIsSimpleWinnerData(
  data: GenericData,
): asserts data is SimpleWinnerData {
  const { market } = data;

  const asserted =
    market.header == null &&
    market.label == null &&
    market.value.handicap == null &&
    market.value.name != null;

  if (!asserted) {
    throw new Error("Not a Simple Winner Data: " + JSON.stringify(data));
  }
}
