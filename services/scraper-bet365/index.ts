import extract from "./extract";
import transform from "./transform";
import load from "./load";

import { Data } from "./scraper/types";

import DB from "@bet/db";

// TODO move database to a service
DB.getInstance()
  .connect()
  .then(() => {
    console.log(`Starting bet365 sync...`);

    extract((data: Data) => {
      transform(data, load);
    });
  });
