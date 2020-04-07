import { Total } from "@bet/types/bettable/markets";

function isInteger(value: number): boolean {
  return value % 1 === 0;
}

export function check(a: Total, b: Total): boolean {
  // One operator must be 'under' and the other must be 'over'.
  if (a.value[0] === b.value[0]) {
    return false;
  }

  const operations = [a, b];
  const under = operations.find((o) => o.value[0] === "under");
  const over = operations.find((o) => o.value[0] === "over");

  if (under === undefined || over === undefined) {
    throw new Error(`Can't find value for operator!`);
  }

  // If any of the values are integer, we want a 0.5 difference between
  // them, otherwise we can't cover all possibilities.
  if (isInteger(under.value[1]) || isInteger(over.value[1])) {
    return under.value[1] - over.value[1] === 0.5;
  }

  // No values are integer, so we just make sure they're equal.
  return a.value[1] === b.value[1];
}
