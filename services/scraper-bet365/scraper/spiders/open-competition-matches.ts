import puppeteer from "puppeteer";
import { Egg } from "../types";

import openMarketTabs from "./open-market-tabs";
import { hasClass } from "../utils/element";

/** The main match class */
const MATCH_CLASS = "sgl-ParticipantFixtureDetails";

/** The date headers for a set of matches */
const DATE_CLASS = "rcl-MarketHeaderLabel-isdate";

/** XPath to find match and date heading elements together. Do not match matches with no additional markets. */
const MATCH_OR_DATE_XPATH =
  `//div[` +
  `contains(concat(' ', normalize-space(@class), ' '), ' ${DATE_CLASS} ')` +
  ` or ` +
  `contains(concat(' ', normalize-space(@class), ' '), ' ${MATCH_CLASS} ')` +
  ` and ` +
  // TODO implement support for matches with moneyline markets only
  `not(contains(concat(' ', normalize-space(@class), ' '), ' sgl-ParticipantFixtureDetails_NoAdditionalMarkets '))` +
  `]`;

/** The clock inside a match. It's presence indicate that the match is live now. */
const IN_PLAY_CLOCK_SELECTOR = ".pi-CouponParticipantClockInPlay";

/** Time of the current match */
const MATCH_TIME_SELECTOR = ".sgl-ParticipantFixtureDetails_BookCloses";

/** Each participant of the match. Usually two in a match. */
const PARTICIPANT_SELECTOR = ".sgl-ParticipantFixtureDetails_Team";

/**
 * Tests if it's a live match by looking for an In Play Clock.
 * @param element The element to be tested
 * @returns `true` if this element represents a live match. `false` otherwise.
 */
async function isLiveMatch(element: puppeteer.ElementHandle<any>) {
  const inPlayClockElement = await element.$(IN_PLAY_CLOCK_SELECTOR);
  return inPlayClockElement != null;
}

/**
 * Test to see if this is a date element by testing the element's class.
 * @param element The element to be tested
 * @returns `true` if the element is a date element. `false` otherwise.
 */
async function isDateElement(element: puppeteer.ElementHandle<any>) {
  return await hasClass(element, DATE_CLASS);
}

/**
 * Gets all matches and xpaths with their dates and yields them.
 * @param page The current page.
 * @param xpath The xpath in which to find the matches.
 * @yields Match element, XPath and date
 */
async function* getMatches(page: puppeteer.Page, xpath: string) {
  /**
   * Gets contextualized match or date XPath for either all or a specific element.
   * The XPath is narrowed to the current competition.
   * @param index The index of the element (optional)
   */
  const getMatchOrDateXPath = function (index?: number) {
    return `${xpath}${MATCH_OR_DATE_XPATH}${index != null ? `[${index}]` : ""}`;
  };

  /**
   * Gets either all or a specific contextualized match or date element.
   * @param index The index of the element to be retrieved. If not provided
   * will return all the elements.
   */
  const getMatchOrDateElements = async function (index?: number) {
    return await page.$x(getMatchOrDateXPath(index));
  };

  let date: string | null = null;

  const length = (await getMatchOrDateElements()).length;

  for (let index = 1; index <= length; index++) {
    // This can come right after a navigation, so we better check.

    await page.waitForXPath(getMatchOrDateXPath(index));
    const matchOrDateElement = (await getMatchOrDateElements(index))[0];

    if (matchOrDateElement == null) {
      console.error("Match or Date element does not exist.");
      return;
    }

    // If it's a date element, only get the date and continue to the match
    if (await isDateElement(matchOrDateElement)) {
      date = await matchOrDateElement.evaluate((el) => el.textContent);
      continue;
    }

    if (date == null) {
      throw new Error("Date is supposed to be defined, but it's not.");
    }

    // It's a match!
    yield {
      matchElement: matchOrDateElement,
      date,
    };
  }
}

/**
 * Tests if date and time are inside the pre-configured timespan
 * @param date
 * @param time
 * @returns `true` if it's inside the timespan, `false` otherwise.
 */
function isInsideTimeSpan(date: string, time: string) {
  console.warn("WARN: Timespan filter not implemented!");
  return true;
}

/**
 * Gets each match in a competition block. Filter out live matches and
 * ones that are outside of the configured time span. Then deploys
 * spiders to deal with each market tab.
 */
async function run(egg: Egg) {
  const { page, data, xpath } = egg;

  if (xpath == null) {
    throw new Error("XPath should be defined");
  }

  for await (const { matchElement, date } of getMatches(page, xpath)) {
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
    const time = await timeElement.evaluate((el) => el.textContent);

    // Filter out matches outside time span
    if (!isInsideTimeSpan(date, time)) {
      continue;
    }

    // Get participants
    const participantsElements = await matchElement.$$(PARTICIPANT_SELECTOR);
    if (participantsElements.length !== 2) {
      console.error(
        `Expected to find 2 participants elements ` +
          `but found ${participantsElements.length}`,
      );
      continue;
    }

    const participants: string[] = [];
    participants.push(
      await participantsElements[0].evaluate((el) => el.textContent),
    );
    participants.push(
      await participantsElements[1].evaluate((el) => el.textContent),
    );

    await matchElement.click();

    await openMarketTabs({
      page,
      data: {
        ...data,
        eventDate: date,
        eventTime: time,
        eventParticipants: participants as [string, string],
      },
    });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      page.goBack(),
    ]);
  }
}

export default run;
