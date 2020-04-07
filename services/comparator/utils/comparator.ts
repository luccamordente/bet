import { Bettable } from "@bet/types";
import { Market } from "@bet/types/bettable/markets";
import { Opportunity, Stakeable } from "../models/opportunity";

import * as operations from "./operations";

function periodMatches(a: Market, b: Market): boolean {
  // TODO make sure we cover all types possibilities
  if (a.period === b.period) {
    return true;
  }
  return a.period[0] === b.period[0] && a.period[1] === b.period[1];
}

/**
 * Validates if bettables are complementary by looking at the
 * market type and matching the operations against each other.
 */
function isComplementary(a: Bettable, b: Bettable): boolean {
  if (
    a.market.team !== b.market.team ||
    a.market.unit !== b.market.unit ||
    !periodMatches(a.market, b.market)
  ) {
    return false;
  }

  // TODO make sure b.market is compatible
  switch (a.market.operation) {
    case "over_under":
      return operations.OverUnder.check(a.market, b.market);
    case "spread":
      return operations.Spread.check(a.market, b.market);
    case "binary":
      return operations.Binary.check(a.market, b.market);
  }
}

/**
 * Combines complementary items in a comparable manner.
 * Each item is only combined with items from different houses.
 */
function combine<T>(
  items: T[],
  filter: (a: T, b: T, i: number, j: number) => boolean,
): [T, T][] {
  const final: [T, T][] = [];

  for (let i = 0; i < items.length; i++) {
    const a = items[i];

    for (let j = i; j < items.length; j++) {
      const b = items[j];

      if (!filter(a, b, i, j)) {
        continue;
      }

      final.push([a, b]);
    }
  }

  return final;
}

/**
 * Calculate the profit off two odds, assuming they are complementary.
 */
function calculateProfit(a: number, b: number): number {
  const [stakeA, stakeB] = calculateStake(a, b);
  const profit = (a * stakeA + b * stakeB) / 2 - 1;
  return profit;
}

function calculateStake(oddA: number, oddB: number): [number, number] {
  const sum = oddA + oddB;
  const aRatio = oddA / sum;
  const bRatio = oddB / sum;

  // This needs to be inverted to guarantee returns
  return [bRatio, aRatio];
}

function compute(a: Bettable, b: Bettable): Opportunity {
  const [stakeA, stakeB] = calculateStake(a.odd, b.odd);
  const stakeableA: Stakeable = Object.assign({ stake: stakeA }, a);
  const stakeableB: Stakeable = Object.assign({ stake: stakeB }, b);

  const date = new Date();

  return {
    stakeables: [stakeableA, stakeableB],
    profit: calculateProfit(stakeableA.odd, stakeableB.odd),
    createdAt: date,
    updatedAt: date,
  };
}

function compare(bettables: Bettable[]): Opportunity[] {
  const combined = combine<Bettable>(bettables, (a, b, i, j) => {
    return !(
      // Don't want to combine with itself
      (
        i === j ||
        // Don't want to combine bettables on the same house
        a.house === b.house ||
        // Don't want to combine bettables that are not complimentary
        !isComplementary(a, b)
      )
    );
  });
  return combined.map((pair) => {
    return compute(...pair);
  });
}

export default compare;
