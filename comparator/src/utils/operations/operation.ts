import { MarketOperation } from "../../models/bettable";

export default abstract class Operation<T> {
  public operationA: MarketOperation<T>;
  public operationB: MarketOperation<T>;

  constructor(operationA, operationB) {
    this.operationA = operationA;
    this.operationB = operationB;
  }

  abstract check(): boolean;
}