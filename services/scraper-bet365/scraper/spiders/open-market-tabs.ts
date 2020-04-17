import puppeteer from "puppeteer";
import { Egg } from "../types";

import openMarketGroups from "./open-market-groups";
import { hasClass } from "../utils/element";

const TAB_CLASS = "cl-MarketGroupNavBarButton";
const SELECTED_TAB_CLASS = "cl-MarketGroupNavBarButton_Selected";

const TAB_XPATH = `//div[contains(concat(' ', normalize-space(@class), ' '), ' ${TAB_CLASS} ')]`;

async function isTabSelected(element: puppeteer.ElementHandle) {
  return await hasClass(element, SELECTED_TAB_CLASS);
}

async function run(egg: Egg) {
  const { page, data } = egg;

  async function* getTabElements() {
    const length = (await page.$x(TAB_XPATH)).length;

    for (let index = 1; index <= length; index++) {
      const xpath = `${TAB_XPATH}[${index}]`;
      await page.waitForXPath(xpath);

      const tabElement = (await page.$x(xpath))[0];
      yield tabElement;
    }
  }

  await page.waitForXPath(TAB_XPATH);

  for await (const tabElement of getTabElements()) {
    if (!(await isTabSelected(tabElement))) {
      await Promise.all([
        // Make sure the URL changes before moving on
        page.waitForNavigation(),
        tabElement.click(),
      ]);
    }

    const url = page.url();

    await openMarketGroups({
      page,
      data: {
        ...data,
        url,
      },
    });
  }

  // Remove this to allow the process to continue
  process.exit(0);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.goBack(),
  ]);
}

export default run;
