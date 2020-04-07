import scraper from "./scraper";
import store from "./storage";

import DB from "@bet/db";

// TODO move database to a service
DB.getInstance()
  .connect()
  .then(() => {
    console.log(`Starting Pinnacle sync...`);
    scraper.run(store);
  });
