import { Bettable } from "./bettable";

interface Success {
  readonly ok: true;
  readonly bettable: Bettable;
}

interface Failure {
  readonly ok: false;
  readonly message: string;
  readonly data: unknown;
}

export type NormalizeResult = Success | Failure;