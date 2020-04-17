import { NewBettable } from "./bettable";

interface Success {
  readonly ok: true;
  readonly bettables: readonly NewBettable[];
}

interface Failure {
  readonly ok: false;
  readonly code:
    | "sport_not_supported"
    | "no_normalizer"
    | "invalid_data"
    | "not_classified"
    | "unknown";
  readonly message: string;
  readonly data: unknown;
}

export type NormalizeResult = Success | Failure;
