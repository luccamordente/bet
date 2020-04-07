import { Bettable } from "@bet/types";

function p(obj: unknown) {
  return JSON.stringify(obj).padStart(15);
}

export function debugComplementTest(a: Bettable, b: Bettable) {
  console.log(
    `${p("House")} | ${p(a.house)} | ${p(b.house)}\n` +
      `${p("Kind")} | ${p(a.market.kind)} | ${p(b.market.kind)}\n` +
      `${p("Operation")} | ${p(a.market.operation)} | ${p(
        b.market.operation,
      )}\n` +
      `${p("Unit")} | ${p(a.market.unit)} | ${p(b.market.unit)}\n` +
      `${p("Team")} | ${p(a.market.team)} | ${p(b.market.team)}\n` +
      `${p("Value")} | ${p(a.market.value)} | ${p(b.market.value)}\n`,
  );
}
