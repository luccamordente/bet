import { NewBettable } from "@bet/types";
import { save } from "./bettable";

function log(bettable: NewBettable) {
  const {
    sport,
    market,
    odd,
    event: { starts_at, participants },
    url,
  } = bettable;

  console.log(
    `💾 Marathon ${sport} ${market.kind}` +
      ` (${market.value} ⇢ ${Math.round(odd * 100) / 100})` +
      ` ${starts_at.toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: undefined,
        month: "short",
        day: "numeric",
        weekday: "short",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZoneName: "short",
      })}` +
      ` ${participants.home} × ${participants.away}` +
      ` ${url}`,
  );
}

export default async function store(bettable: NewBettable) {
  return await save(bettable)
    .then(() => {
      log(bettable);
    })
    .catch((error) => {
      console.error("Error sending bettable to storage", error);
    });
}
