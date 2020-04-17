import vanillaPuppeteer, { Page } from "puppeteer";

import { addExtra } from "puppeteer-extra";

import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";

import { random } from "./array";

const VIEWPORTS = [
  { width: 1360, height: 768 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 1280, height: 800 },
  { width: 1280, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1600, height: 900 },
  { width: 1680, height: 1050 },
  { width: 1920, height: 1080 },
  { width: 1920, height: 1200 },
  { width: 2560, height: 1080 },
];

const MIRRORS = [
  "https://www.bet365.com",
  "https://www.28-365365.com",
  "https://www.28365-365.com",
  "https://www.allsport365.com",
  "https://www.288365.com",
  "https://www.365-808.com",
  "https://www.38365365.com",
  "https://www.635288.com",
  "https://www.36500365.com",
  "https://www.488365.com",
  "https://www.248365365.com",
  "https://www.365466.com",
  "https://www.878365.com",
  "https://www.68365365.com",
];

function getRandomViewport(): { width: number; height: number } {
  const deadHeight = 90 + Math.round(Math.random() * 40);
  const resolutions = VIEWPORTS;

  const pick = { ...random(resolutions) };
  pick.height -= deadHeight;
  return pick;
}

function setupPuppeteer() {
  const puppeteer = addExtra(vanillaPuppeteer);

  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/console.debug")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/chrome.runtime")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/console.debug")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/media.codecs")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/navigator.languages")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/navigator.permissions")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/navigator.plugins")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/navigator.webdriver")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/user-agent-override")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/webgl.vendor")(),
  );
  puppeteer.use(
    require("puppeteer-extra-plugin-stealth/evasions/window.outerdimensions")(),
  );

  puppeteer.use(AnonymizeUAPlugin());

  return puppeteer;
}

async function launch() {
  const puppeteer = setupPuppeteer();

  return await puppeteer.launch({
    headless: true,
    defaultViewport: getRandomViewport(),
    args: [],
  });
}

async function withWebsite(todo: (page: Page) => Promise<void>) {
  const browser = await launch();

  const page = await browser.newPage();
  await page.goto(random(MIRRORS));

  try {
    await todo(page);
  } catch (error) {
    browser.close();
    throw error;
  }

  browser.close();
}

export default withWebsite;
