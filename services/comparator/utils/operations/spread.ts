import Operation from './operation';

export default class Spread extends Operation<"spread"> {
  check(): boolean {
    return this.operationA.operator !== this.operationB.operator
    && this.operationA.value === -this.operationB.value;
  }
}