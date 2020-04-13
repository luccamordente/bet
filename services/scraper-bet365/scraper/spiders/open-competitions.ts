import puppeteer from "puppeteer";
import { Data } from "../types";

import openMatches from "./open-competition-matches";

interface Params {
  data: Data;
  page: puppeteer.Page;
}

const COMPETITION_SELECTOR = "div.src-CompetitionMarketGroup";

/**
 * Look for all leagues in the page, get it's name and
 * send spiders to open the matches.
 */
async function run(params: Params) {
  const { page, data } = params;

  await page.waitForSelector(COMPETITION_SELECTOR);

  const competitionsElements = await page.$$(COMPETITION_SELECTOR);

  for (const competitionElement of competitionsElements) {
    // We assume all competitions dropdowns are open
    const competitionLabelElement = await competitionElement.$(
      ".src-CompetitionMarketGroupButton_Text",
    );

    if (competitionLabelElement == null) {
      console.error(`Can't find competition label element!`);
      continue;
    }

    const leagueName = await competitionLabelElement.evaluate(
      (el) => el.innerText,
    );
    await openMatches({
      page,
      data: { ...data, leagueName },
      element: competitionElement,
    });
  }
}

export default run;
