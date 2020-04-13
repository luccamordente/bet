export type ActionKind =
  | "open-sport-page"
  | "open-all-matches-page"
  | "retrieve-all-leagues"
  | "open-league"
  | "retrieve-all-matches"
  | "open-match"
  | "retrieve-all-market-tabs"
  | "open-market-tab"
  | "retrieve-all-market-groups"
  | "open-market-group"
  | "retrieve-market-matrix";

export interface Action {
  kind: ActionKind;
  options: object;
  next?: Action;
}

export interface Routine {
  actions: Action[];
}

interface ChainedRoutine {
  action: Action;
}

export function createChainedRoutine(routine: Routine): ChainedRoutine {
  const { actions } = routine;
  const chain: ChainedRoutine = {
    action: actions[actions.length - 1],
  };

  for (let index = actions.length - 1; index >= 0; index--) {
    const link: Action = {
      ...actions[index],
      next: chain.action,
    };
    chain.action = link;
  }

  return chain;
}
