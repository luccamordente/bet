import puppeteer from "puppeteer";
import { Data } from "../types";

import openAllMatches from "./open-all-matches";

const SPORTS = ["E-Sports"];

interface Params {
  data: Data;
  page: puppeteer.Page;
}

async function run(params: Params) {
  const { page, data } = params;

  // Wait for menu to load
  await page.waitForSelector(".wn-WebNavModule");

  // For each menu item, click it and deploy a spider
  for (const sport of SPORTS) {
    const item = (
      await page.$x(
        `//div[contains(@class,'wn-Classification')][contains(text(), '${sport}')]`,
      )
    )[0];

    if (item == null) {
      console.error(`Menu item not found for '${sport}' sport.`);
      continue;
    }

    // Click the menu item and wait for everything to load
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      item.click(),
    ]);

    switch (sport) {
      case "E-Sports":
        await openAllMatches({ page, data: { ...data, sportName: sport } });
        break;
      default:
        console.log(`No spider for '${sport}' sport.`);
        break;
    }
  }
}

export default run;
