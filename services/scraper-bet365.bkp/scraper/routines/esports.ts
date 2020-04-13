import { assertEnv } from "@bet/assert";

assertEnv(process.env, ["EVENT_TIME_SPAN_HOURS"]);
const { EVENT_TIME_SPAN_HOURS } = process.env;

export default {
  actions: [
    {
      kind: "open-sport-page",
      options: { sport: "Esports" },
    },
    { kind: "open-all-matches-page" },
    { kind: "retrieve-all-leagues" },
    { kind: "open-league" },
    {
      kind: "retrieve-all-matches",
      options: { filter: { timespan: EVENT_TIME_SPAN_HOURS } },
    },
    { kind: "open-match" },
    { kind: "retrieve-all-market-tabs" },
    { kind: "open-market-tab" },
    { kind: "retrieve-all-market-groups" },
    { kind: "open-market-group" },
    { kind: "retrieve-market-matrix" },
  ],
};
