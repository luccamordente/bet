import DB from "@bet/db";

import scraper from "./scraper";
import store from "./storage";
import server from "./server";

// TODO move database to a service
DB.getInstance()
  .connect()
  .then(() => {
    console.log(`Starting Pinnacle sync...`);
    scraper.run(store);
  });

server.listen(8080);
