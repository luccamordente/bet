interface Event {
  readonly league: string;
  readonly starts_at: Date;
  readonly participants: {
    readonly home: string;
    readonly away: string;
  };
}

export interface GenericMarket {
  readonly kind: string;
  readonly operation: string;
  readonly period: readonly [string, number] | "match";
  readonly team: string | null;
  readonly unit: string;
  readonly value: readonly [string, number] | string;
}

export interface GenericBettable {
  readonly _id: string;
  readonly odd: number;
  readonly market: GenericMarket;
  readonly house: string;
  readonly sport: string;
  readonly event: Event;
  readonly extracted_at: Date;
  readonly url: string;
}
