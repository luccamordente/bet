import { MarketOperation } from '../models/bettable';

class OverUnder {
  public operationA: MarketOperation<"over_under">;
  public operationB: MarketOperation<"over_under">;

  constructor(operationA, operationB) {
    this.operationA = operationA;
    this.operationB = operationB;
  }

  check(): boolean {
    return this.operationA.operator !== this.operationB.operator
    && this.operationA.value === this.operationB.value;
  }
}

export {
  OverUnder
};