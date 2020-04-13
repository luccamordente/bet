import puppeteer from "puppeteer";
import { Data } from "../types";

import openCompetitions from "./open-competitions";

interface Params {
  data: Data;
  page: puppeteer.Page;
}

const ALL_MATCHES_LABEL = "Todas as Partidas";

/**
 * Looks for the "All Matches" link and click it.
 * Passes page to next spider to open the competitions.
 */
async function run(params: Params) {
  const { page, data } = params;

  const item = (
    await page.$x(
      `//div[contains(@class,'sm-CouponLink')]//*[contains(text(), '${ALL_MATCHES_LABEL}')]`,
    )
  )[0];

  if (item == null) {
    console.error(`"All Matches" link not found.`);
    return;
  }

  await item.click();

  await openCompetitions({ page, data: { ...data } });
}

export default run;
