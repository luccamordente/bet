interface Bettable {
  odd: number,
  market: {
    key: "total_points",
    type: "over_under",
    operation: {
      operator: "over" | "under",
      value: number,
    },
  },
  house: "1xbet" | "pinnacle",
  sport: "football",
  event: {
    league: string,
    starts_at: Date,
    participants: {
      home: string,
      away: string,
    },
  },
};

export { Bettable };