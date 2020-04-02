import { GenericBettable, GenericPeriodScope } from "../generic";
import { HandicapMarket, OddEvenMarket, TotalMarket } from "../markets";

type Period = "half";
type Unit = "goals";

export default interface SoccerBettable extends GenericBettable {
  sport: "soccer";
  market: {
    scope: {
      period: ["half", 1 | 2] | "match";
      team: 1;
    }
  } extends HandicapMarket
    // | HandicapMarket<Period, Unit>
    // | OddEvenMarket<Period, Unit>
    // | TotalMarket<Period, Unit>;
}
