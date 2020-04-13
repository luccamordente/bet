import puppeteer from "puppeteer";
import { Data } from "../types";

interface Params {
  data: Data;
  page: puppeteer.Page;
  element: puppeteer.ElementHandle;
}

const MATCH_SELECTOR = ".sgl-ParticipantFixtureDetails";
const DATE_SELECTOR = ".rcl-MarketHeaderLabel-isdate";
const IN_PLAY_CLOCK_SELECTOR = ".pi-CouponParticipantClockInPlay";
const MATCH_TIME_SELECTOR = ".sgl-ParticipantFixtureDetails_BookCloses";
const PARTICIPANT_SELECTOR = ".sgl-ParticipantFixtureDetails_Team";

/**
 * Tests if it's a live match by looking for an In Play Clock
 */
async function isLiveMatch(element: puppeteer.ElementHandle<any>) {
  const inPlayClockElement = await element.$(IN_PLAY_CLOCK_SELECTOR);
  return inPlayClockElement != null;
}

/**
 * Test to see if this is a date element
 */
async function isDateElement(matchOrDateElement: puppeteer.ElementHandle<any>) {
  return (await matchOrDateElement.evaluate(
    (el, selector) => el.classList.contains(selector.replace(".", "")),
    DATE_SELECTOR,
  )) as boolean;
}

/**
 * Gets each match in a competition block. Filter out live matches and
 * ones that are outside of the configured time span. Then deploys
 * spiders to deal with each market tab.
 */
async function run(params: Params) {
  const { page, data, element } = params;

  // Get both match and date elements
  const matchOrDateElements = await element.$$(
    `${MATCH_SELECTOR}, ${DATE_SELECTOR}`,
  );

  let date: string | null = null;
  let matchElement: puppeteer.ElementHandle;

  for (const matchOrDateElement of matchOrDateElements) {
    // If it's a date element, only get the date and continue to the match
    if (await isDateElement(matchOrDateElement)) {
      date = await matchOrDateElement.evaluate((el) => el.innerText);
      continue;
    }
    matchElement = matchOrDateElement;

    // We can't deal with live matches now
    if (await isLiveMatch(matchElement)) {
      continue;
    }

    // Get time
    const timeElement = await matchElement.$(MATCH_TIME_SELECTOR);
    if (timeElement == null) {
      console.error("Error getting match time element");
      continue;
    }
    const time = await timeElement.evaluate((el) => el.innerText);

    // TODO filter here

    // Get participants
    const participantsElements = await matchElement.$$(PARTICIPANT_SELECTOR);
    if (participantsElements.length !== 2) {
      console.error(
        `Expected to find 2 participants elements but found ${participantsElements.length}`,
      );
      continue;
    }

    const participants: string[] = [];
    participants.push(
      await participantsElements[0].evaluate((el) => el.innerText),
    );
    participants.push(
      await participantsElements[1].evaluate((el) => el.innerText),
    );

    await console.log({
      page,
      data: { ...data, eventDate: date, eventTime: time, participants },
      element: matchElement,
    });
  }

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.goBack(),
  ]);
}

export default run;
