export interface League {
  readonly id: number;
  readonly name: string;
}

export interface Match {
  readonly id: number;
  readonly startTime: Date;
  readonly participants: [
    {
      alignment: "home";
      name: string;
    },
    {
      alignment: "away";
      name: string;
    }
  ];
  readonly type: "matchup";
  readonly units: "Regular";
}

export interface Bet {
  readonly sport: string;
  readonly type: "total";
  readonly period: number;
  readonly price: {
    readonly designation: string;
    readonly points: number;
    readonly price: number;
  };
  readonly extractTime: Date;
  readonly key: string;
  readonly matchupId: number;
}
