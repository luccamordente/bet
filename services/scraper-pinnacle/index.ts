import scraper from "./scraper";
import store from "./storage";

import DB from "@bet/db";

const config = {
  time: 1000 * 60 * 60 * 24 * 1, // 24 hours
};

// TODO move database to a service
DB.getInstance()
  .connect()
  .then(() => {
    console.log(`Starting Pinnacle sync...`);
    scraper.run(config, store);
  });
