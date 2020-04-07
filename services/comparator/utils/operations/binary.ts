import { OddEven, Result } from "@bet/types/bettable/markets";

type Market = OddEven | Result;

export function check(a: Market, b: Market): boolean {
  return a.value !== b.value;
}
