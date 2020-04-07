import { Handicap } from "@bet/types/bettable/markets";

export function check(a: Handicap, b: Handicap): boolean {
  return a.value[0] !== b.value[0] && a.value[1] === -b.value[1];
}
