import Operation from './operation';

export default class OverUnder extends Operation<"over_under"> {
  check(): boolean {
    return this.operationA.operator !== this.operationB.operator
    && this.operationA.value === this.operationB.value;
  }
}