import { GenericBettable } from "../generic";

export default interface EsportsBettable extends GenericBettable {
  sport: "esports";
  market:
    | HandicapMarket<"match", Unit>
    | OddEvenMarket<"match", Unit>
    | TotalMarket<"match", Unit>;
}
