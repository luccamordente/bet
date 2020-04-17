import fetch from "node-fetch";
import puppeteer from "puppeteer";

const LANGUAGE = "English";

const LANGUAGE_MENU_SELECTOR = ".fm-Menu_Language";
const LANGUAGE_ITEM_CLASS = "fm-LanguageDropDownItem";
const LANGUAGE_ITEM_XPATH = `//div[contains(@class, '${LANGUAGE_ITEM_CLASS}') and text()='${LANGUAGE}']`;

/**
 * Sets the website language to the value in `LANGUAGE`
 */
async function setLanguage(page: puppeteer.Page) {
  await page.waitForSelector(LANGUAGE_MENU_SELECTOR);

  const languageMenuElement = await page.$(LANGUAGE_MENU_SELECTOR);
  if (languageMenuElement == null) {
    throw new Error("Could not find language menu.");
  }
  await languageMenuElement.click();

  const languageElement = (await page.$x(LANGUAGE_ITEM_XPATH))[0];
  if (languageElement == null) {
    throw new Error("Could not find language to select.");
  }
  await languageElement.click();
}

async function setTimezone(page: puppeteer.Page) {
  const res = await fetch("http://ip-api.com/json");
  const { timezone } = await res.json();
  await page.emulateTimezone(timezone);
}

export default async function setup(page: puppeteer.Page) {
  await setTimezone(page);
  await setLanguage(page);
}
