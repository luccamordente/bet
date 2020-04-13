import puppeteer from "puppeteer";
import { Data } from "../types";

// import { homie } from "./mixins";

interface Params {
  data: Data;
  page: puppeteer.Page;
  options: {
    sport?: string;
  };
}

async function run(params: Params) {
  const { page, data, options } = params;

  if (options.sport == null) {
    return [];
  }

  await page.waitForSelector(".wn-WebNavModule");

  const menuItem = await page.$$eval(".wn-Classification ", (items) =>
    items.find((item) => item.innerText.trim() === "Esports"),
  );

  menuItem.click();

  return [
    {
      data: { ...data, sportName: `${menuItem}` },
      page: page,
    },
  ];
}

// export default homie(run);
export default run;
