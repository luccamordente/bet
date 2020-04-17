import puppeteer from "puppeteer";
import { Egg } from "../types";

import openMarketTabs from "./open-market-tabs";
import { hasClass } from "../utils/element";

import { assertEnv } from "@bet/assert";

assertEnv(process.env, ["EVENT_TIME_SPAN_HOURS"]);
const { EVENT_TIME_SPAN_HOURS } = process.env;

/** The main match class */
const MATCH_CLASS = "sgl-ParticipantFixtureDetails";

/** The date headers for a set of matches */
const DATE_CLASS = "rcl-MarketHeaderLabel-isdate";

/** XPath to find match Do not match matches with no additional markets. */
const MATCH_XPATH =
  `//div[` +
  `contains(concat(' ', normalize-space(@class), ' '), ' ${MATCH_CLASS} ')` +
  ` and ` +
  // TODO implement support for matches with moneyline markets only
  `not(contains(concat(' ', normalize-space(@class), ' '), ' sgl-ParticipantFixtureDetails_NoAdditionalMarkets '))` +
  `]`;

/** XPath to be used in conjunction with a match XPath to get the nearest preceding date element */
const PRECEDING_DATE_XPATH = `/preceding-sibling::div[contains(concat(' ', normalize-space(@class), ' '), ' ${DATE_CLASS} ')]`;

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
   * Gets contextualized match XPath for either all or a specific match.
   * The XPath is narrowed to the current competition.
   * @param index The index of the element (optional)
   */
  const getMatchXPath = function (index?: number) {
    return `${xpath}${MATCH_XPATH}${index != null ? `[${index}]` : ""}`;
  };

  /**
   * Gets either all or a specific contextualized match element.
   * @param index The index of the element to be retrieved. If not provided
   * will return all the elements.
   */
  const getMatchElements = async function (index?: number) {
    return await page.$x(getMatchXPath(index));
  };

  /**
   * Gets the corresponding date element from a match index.
   * @param index The index of the match element for which to
   * retrieve the date element.
   */
  const getDateElementForMatch = async function (index: number) {
    const dates = await page.$x(getMatchXPath(index) + PRECEDING_DATE_XPATH);
    // Elements will come in reverse order, so we need to get the last match.
    return dates.pop();
  };

  let date: string | null = null;

  const length = (await getMatchElements()).length;

  for (let index = 1; index <= length; index++) {
    // This can come right after a navigation, so we better check.

    // Get the match element
    await page.waitForXPath(getMatchXPath(index));
    const matchElement = (await getMatchElements(index))[0];

    if (matchElement == null) {
      console.error("Match element does not exist anymore.");
      return;
    }

    // Get the date
    const dateElement = await getDateElementForMatch(index);
    if (dateElement == null) {
      console.error("Couldn't find a date element for match");
      return;
    }

    date = await dateElement.evaluate((el) => el.textContent);
    if (date == null) {
      throw new Error("Date is supposed to be defined, but it's not.");
    }

    yield {
      matchElement,
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
function isInsideTimeSpan(date: Date) {
  return (
    date.getTime() - new Date().getTime() <
    parseInt(EVENT_TIME_SPAN_HOURS) * 60 * 60 * 1000
  );
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

    const startTime = new Date(
      await page.evaluate(
        (d, t) => {
          return new Date(
            `${d} ${new Date().getFullYear()} ${t}`,
          ).toISOString();
        },
        date,
        time,
      ),
    );

    // Filter out matches outside time span
    if (!isInsideTimeSpan(startTime)) {
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
        eventStartTime: startTime,
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
