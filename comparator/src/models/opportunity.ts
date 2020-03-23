import { Bettable } from "./bettable";

export type Stakeable = Bettable & {
  stake: number;
};

type Combination = [Stakeable, Stakeable];

export type Opportunity = {
  stakeables: Combination,
  profit: number,
  createdAt: Date;
};