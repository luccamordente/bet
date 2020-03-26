import { Bettable, Odd, MarketType } from '../models/bettable';
import { Opportunity, Stakeable } from '../models/opportunity';

import * as Operations from './operations';

const OPERATIONS_MAP: Record<MarketType, any extends typeof Operations.Operation ? any : never> = {
  'over_under': Operations.OverUnder,
  'spread': Operations.Spread,
}

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
    case "spread":
      return new Operations.Spread(a.market.operation, b.market.operation).check();
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
  const [aRatio, bRatio] = calculateStake(a, b);
  const profit = (a * bRatio + b * aRatio) / 2 - 1;
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
      i === j
      // Don't want to combine bettables on the same house
      || a.house === b.house
      // Don't want to combine bettables that are not complimentary
      || !isComplementary(a, b)
    );
  });
  return combined.map( pair => {
    return compute(...pair);
  });
};

export default compare;