import openSports from "./spiders/open-sports";
import withWebsite from "./utils/website";

export async function fetch() {
  await withWebsite(async (page) => {
    await openSports({ page, data: {} });
  });
}
