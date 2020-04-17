import { fetch } from "./scraper/nest";
import { Data } from "./scraper/types";

async function run(emit: (data: Data) => void) {
  fetch(emit);
}

export default run;
