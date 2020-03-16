import { Bettable, Odd } from '../models/bettable';

import * as Operations from './operation';

type Combination = [Bettable, Bettable];

interface Profitable {
  bettables: Combination,
  profit: number,
  createdAt: Date;
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
function combine<T>(
    items: T[],
    filter: (a: T, b: T, i: number, j: number) => boolean
  ): [T,T][] {
  const final = [];

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
function calculateProfit(a: Odd, b: Odd): number {
  const sum = a + b;
  const aRatio = a / sum;
  const bRatio = b / sum;
  const profit = (a * bRatio + b * aRatio) / 2 - 1;
  return profit;
}

function compare(bettables: Bettable[]): Profitable[] {
  const combined = combine<Bettable>(bettables, (a, b, i, j) => {
    return !(
      // Don't want to combine with itself
      i === j
      // Don't want to combine bettables on the same house
      || a.house === b.house
      // Don't want to combine bettables that are not complimentary
      || !isComplementary(a, b)
    );
  });
  return combined.map( pair => {
    return {
      bettables: pair,
      profit: calculateProfit(pair[0].odd, pair[1].odd),
      createdAt: new Date(),
    };
  });
};

export default compare;
export { Profitable };