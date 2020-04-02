interface Event {
  league: string;
  starts_at: Date;
  participants: {
    home: string;
    away: string;
  };
}

export interface GenericBettable {
  _id: string;
  odd: number;
  market: object;
  house: string;
  sport: string;
  event: Event;
  extracted_at: Date;
  url: string;
}