import puppeteer from "puppeteer";
import { Data } from "../types";

interface Params {
  data: Data;
  page: puppeteer.Page;
  element: puppeteer.ElementHandle;
}

/**
 *
 */
async function run(params: Params) {
  const { page, data, element } = params;

  const matches = await element.$x(
    `//div[contains(@class,'sgl-ParticipantFixtureDetails')]`,
  );

  for (const match of matches) {
    // In Play Clock existance implies that match is live.
    const inPlayClock = await match.$(".pi-CouponParticipantClockInPlay");
    if (inPlayClock != null) {
      // Skip In Play matches
      continue;
    }

    // TODO Get date, time and filter

    await openMatch({ page, data: { ...data }, element: match });
    break; // TODO remove this
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.goBack(),
  ]);
}

export default run;
