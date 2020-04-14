import puppeteer from "puppeteer";
import { Egg } from "../types";

const MARKET_GROUP_CLASS = "gl-MarketGroup";
const MARKET_GROUP_XPATH = `//div[contains(concat(' ', normalize-space(@class), ' '), ' ${MARKET_GROUP_CLASS} ')]`;
const MARKET_GROUP_BUTTON_TEXT_CLASS = "gl-MarketGroupButton_Text";
const MARKET_GROUP_BUTTON_TEXT_SELECTOR = `.${MARKET_GROUP_BUTTON_TEXT_CLASS}`;

async function convertToMatrix(element: puppeteer.ElementHandle) {
  return await element.evaluate((el) => el.textContent);
}

async function run(egg: Egg) {
  const { page, data } = egg;

  /**
   * Get all market group elements.
   * We can get all elements at once because the nodes will
   * not be detached from the DOM while we use them.
   */
  async function* getMarketGroupElements() {
    const elements = await page.$x(MARKET_GROUP_XPATH);
    for (const element of elements) {
      yield element;
    }
  }

  await page.waitForXPath(MARKET_GROUP_XPATH);

  for await (const marketGroupElement of getMarketGroupElements()) {
    const marketGroupLabelElement = await marketGroupElement.$(
      MARKET_GROUP_BUTTON_TEXT_SELECTOR,
    );
    if (marketGroupLabelElement == null) {
      throw new Error("Market group label element should exist.");
    }
    const marketGroup = await marketGroupLabelElement.evaluate(
      (el) => el.textContent,
    );

    const marketMatrix = await convertToMatrix(marketGroupElement);

    console.log({
      data: {
        ...data,
        marketGroup,
        marketMatrix,
      },
    });
  }
}

export default run;
