import { NewBettable } from "@bet/types";
import { Data } from "./scraper/runner";

type Listener = (bettable: NewBettable) => void;

function transform(data: Data, emit: Listener): void {
  console.log(data);
  // emit({
  //   house: "bet365",
  // });
}

export default transform;
