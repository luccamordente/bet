import { MarketOperation } from "../../models/bettable";

export default abstract class Operation<T> {
  protected operationA: MarketOperation<T>;
  protected operationB: MarketOperation<T>;

  constructor(operationA: MarketOperation<T>, operationB: MarketOperation<T>) {
    this.operationA = operationA;
    this.operationB = operationB;
  }

  abstract check(): boolean;
}
