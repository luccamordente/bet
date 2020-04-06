export interface League {
  readonly id: number;
  readonly name: string;
  readonly sport: {
    readonly id: number;
    readonly name: string;
  };
}

type HomeAwayParticipants = [
  {
    readonly alignment: string;
    readonly name: string;
  },
  {
    readonly alignment: string;
    readonly name: string;
  },
];

interface Parent {
  readonly id: number;
  readonly participants: HomeAwayParticipants;
}

interface GenericMatchup {
  readonly id: number;
  /** ISO datetime string */
  readonly startTime: string;
  readonly parentId: number | null;
  readonly parent?: Parent;
  readonly league: League;
  readonly participants: object;
  readonly type: "matchup" | "special";
  readonly units: string | null;
}

export interface RootMatchup extends GenericMatchup {
  readonly parentId: null;
  readonly participants: HomeAwayParticipants;
  readonly type: "matchup";
  readonly units: "Regular";
}

export interface ChildMatchup extends GenericMatchup {
  readonly parentId: number;
  readonly parent: Parent;
  readonly participants: HomeAwayParticipants;
  readonly type: "matchup";
  readonly units: string;
}

export interface SpecialMatchup extends GenericMatchup {
  readonly parentId: number;
  readonly parent: Parent;
  readonly participants: readonly [
    {
      alignment: "neutral";
      id: number;
      name: string;
    },
    {
      alignment: "neutral";
      id: number;
      name: string;
    },
  ];
  readonly type: "special";
  readonly units: null;
}

export type Matchup = RootMatchup | ChildMatchup | SpecialMatchup;

type OverUnderDesignationPrices = [
  {
    readonly designation: "over";
    readonly points: number;
    readonly price: number;
  },
  {
    readonly designation: "under";
    readonly points: number;
    readonly price: number;
  },
];

type TeamDesignationPrices = [
  {
    readonly designation: "home";
    readonly price: number;
  },
  {
    readonly designation: "away";
    readonly price: number;
  },
];

type TeamPointDesignationPrices = [
  {
    readonly designation: "home";
    readonly points: number;
    readonly price: number;
  },
  {
    readonly designation: "away";
    readonly points: number;
    readonly price: number;
  },
];

type TeamDrawableDesignationPrices = [
  {
    readonly designation: "home";
    readonly price: number;
  },
  {
    readonly designation: "away";
    readonly price: number;
  },
  {
    readonly designation: "draw";
    readonly price: number;
  },
];

type ParticipantPrices = [
  {
    readonly participantId: number;
    readonly price: number;
  },
  {
    readonly participantId: number;
    readonly price: number;
  },
];

interface GenericMarket {
  readonly cutoffAt: string;
  readonly isAlternate?: boolean;
  readonly key: string;
  readonly limits: unknown;
  readonly matchupId: number;
  readonly period: number;
  readonly prices:
    | OverUnderDesignationPrices
    | TeamDesignationPrices
    | TeamPointDesignationPrices
    | TeamDrawableDesignationPrices
    | ParticipantPrices;
  readonly side?: "home" | "away";
  readonly status?: string;
  readonly type:
    | "moneyline"
    | "special_moneyline"
    | "total"
    | "team_total"
    | "spread";
  readonly version: number;
}

export interface RegularMoneylineMarket extends GenericMarket {
  readonly prices: TeamDesignationPrices | TeamDrawableDesignationPrices;
  readonly type: "moneyline";
}

export interface SpecialMoneylineMarket extends GenericMarket {
  readonly prices: ParticipantPrices;
  readonly type: "special_moneyline";
}

export interface TotalMarket extends GenericMarket {
  readonly prices: OverUnderDesignationPrices;
  readonly type: "total";
}

export interface TeamTotalMarket extends GenericMarket {
  readonly prices: OverUnderDesignationPrices;
  readonly side: "home" | "away";
  readonly type: "team_total";
}

export interface SpreadMarket extends GenericMarket {
  readonly prices: TeamPointDesignationPrices;
  readonly type: "spread";
}

export type Market =
  | RegularMoneylineMarket
  | SpecialMoneylineMarket
  | TotalMarket
  | TeamTotalMarket
  | SpreadMarket;
