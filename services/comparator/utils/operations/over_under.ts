import Operation from './operation';

function isInteger(value: number): boolean {
  return value % 1 === 0;
}

export default class OverUnder extends Operation<"over_under"> {
  check(): boolean {
    // One operator must be 'under' and the other must be 'over'.
    if (this.operationA.operator === this.operationB.operator) {
      return false;
    }

    const operations = [this.operationA, this.operationB];
    const under = operations.find(o => o.operator === 'under');
    const over = operations.find(o => o.operator === 'over');

    if (under === undefined || over === undefined) {
      throw new Error(`Can't find value for operator!`);
    }

    // If any of the values are integer, we want a 0.5 difference between
    // them, otherwise we can't cover all possibilities.
    if (isInteger(under.value) || isInteger(over.value)) {
      return under.value - over.value === 0.5;
    }

    // No values are integer, so we just make sure they're equal.
    return this.operationA.value === this.operationB.value;
  }
}