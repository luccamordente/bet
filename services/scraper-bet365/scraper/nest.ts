import openSports from "./spiders/open-sports";
import withWebsite from "./utils/website";
import setup from "./setup";

import { Data } from "./types";

import em from "./utils/events";

export async function fetch(emit: (data: Data) => void) {
  em.on("data", emit);

  while (true) {
    await withWebsite(async (page) => {
      await setup(page);
      await openSports({ page, data: {} });
    });
  }
}
