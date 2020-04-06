interface Event {
  readonly league: string;
  readonly starts_at: Date;
  readonly participants: {
    readonly home: string;
    readonly away: string;
  };
}

interface Market {
  readonly kind: string;
  readonly operation: string;
  readonly period: readonly [string, number] | "match";
  readonly team?: string;
  readonly unit: string;
}

export interface GenericBettable {
  readonly _id: string;
  readonly odd: number;
  readonly market: Market;
  readonly house: string;
  readonly sport: string;
  readonly event: Event;
  readonly extracted_at: Date;
  readonly url: string;
}
