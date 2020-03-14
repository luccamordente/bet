import { Bettable, Odd } from '../models/bettable';

import * as Operations from './operation';

type Pair = [Bettable, Bettable];

interface Profitable {
  bettables: Pair,
  profit: number,
};

/**
 * Validates if bettables are complementary by looking at the
 * market type and matching the operations against each other.
 */
function isComplementary(a: Bettable, b: Bettable): boolean {
  // Market key and type must be the same for each bettable
  if (
    a.market.key !== b.market.key ||
    a.market.type !== b.market.type
  ) {
    return false;
  }

  switch (a.market.type) {
    case "over_under":
      return new Operations.OverUnder(a.market.operation, b.market.operation).check();

    default:
      throw new Error(`Don't know how to compare "${a.market.type}" kind of market type.`);
  }
}

/**
 * Combines complementary items in a comparable manner.
 * Each item is only combined with items from different houses.
 */
function combine(combinables: Bettable[]): [Bettable, Bettable][] {
  const final = [];

  for (let i = 0; i < combinables.length; i++) {
    const a = combinables[i];
    for (let j = 0; j < combinables.length; j++) {
      // Do not combine with itselft
      if (i === j) {
        continue;
      }

      const b = combinables[j];

      // Do not combine with items on same house
      if (a.house === b.house) {
        continue;
      }

      if (isComplementary(a, b)) {
        final.push([a, b]);
      }
    }
  }

  return final;
}

/**
 * Calculate the profit off two odds, assuming they are complementary.
 */
function calculateProfit(a: Odd, b: Odd): number {
  const sum = a + b;
  const aRatio = a / sum;
  const bRatio = b / sum;
  const profit = (a * bRatio + b * aRatio) / 2 - 1;
  return profit;
}

function compare(bettables: Bettable[]): Profitable[] {
  const combined = combine(bettables);
  return combined.map( pair => {
    return {
      bettables: pair,
      profit: calculateProfit(pair[0].odd, pair[1].odd),
    };
  });
};

export default compare;