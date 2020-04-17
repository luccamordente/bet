import { Egg } from "../types";

import openAllMatches from "./open-all-matches";

const SPORTS = ["Esports"];

const MENU_SELECTOR = `.wn-Menu`;
const MENU_ITEM_CLASS = `wn-PreMatchItem`;

async function run(egg: Egg) {
  const { page, data } = egg;

  // Wait for menu to load
  await page.waitForSelector(MENU_SELECTOR);

  // For each menu item, click it and deploy a spider
  for (const sport of SPORTS) {
    const item = (
      await page.$x(
        `//div[contains(@class,'${MENU_ITEM_CLASS}')][contains(text(), '${sport}')]`,
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
      case "Esports":
        await openAllMatches({ page, data: { ...data, sportName: sport } });
        break;
      default:
        console.log(`No spider for '${sport}' sport.`);
        break;
    }
  }
}

export default run;
