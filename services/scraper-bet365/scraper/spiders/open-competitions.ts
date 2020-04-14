import puppeteer from "puppeteer";
import { Egg } from "../types";

import openCompetitionMatches from "./open-competition-matches";

const COMPETITION_XPATH =
  "//div[contains(concat(' ', normalize-space(@class), ' '), ' src-CompetitionMarketGroup ')]";

/**
 * Get's all competitions and their XPaths.
 * @param page The current page.
 * @yields Competition element and XPath.
 */
async function* getCompetitionsElements(page: puppeteer.Page) {
  await page.waitForXPath(COMPETITION_XPATH);
  const length = (await page.$x(COMPETITION_XPATH)).length;

  for (let index = 1; index <= length; index++) {
    const xpath = `${COMPETITION_XPATH}[${index}]`;

    // This can come right after a navigation, so we better check.
    await page.waitForXPath(xpath);
    const element = (await page.$x(xpath))[0];

    yield { xpath, element };
  }
}

/**
 * Look for all leagues in the page, get it's name and
 * send spiders to open the matches.
 */
async function run(egg: Egg) {
  const { page, data } = egg;

  for await (const competition of getCompetitionsElements(page)) {
    // We assume all competitions dropdowns are open
    const competitionLabelElement = await competition.element.$(
      ".src-CompetitionMarketGroupButton_Text",
    );

    if (competitionLabelElement == null) {
      console.error(`Can't find competition label element!`);
      continue;
    }

    const leagueName = await competitionLabelElement.evaluate(
      (el) => el.textContent,
    );
    await openCompetitionMatches({
      page,
      data: { ...data, leagueName },
      xpath: competition.xpath,
    });
  }
}

export default run;
