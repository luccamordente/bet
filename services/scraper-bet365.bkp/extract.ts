import scrape, { Data } from "./scraper/runner";

async function run(load: (data: Data) => void) {
  scrape(load);
}

export default run;
