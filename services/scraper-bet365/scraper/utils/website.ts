import puppeteer from "puppeteer";
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
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246",
  "Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36",
];

function getRandomViewport(): { width: number; height: number } {
  const deadHeight = 90 + Math.round(Math.random() * 40);
  const resolutions = VIEWPORTS;

  const pick = { ...random(resolutions) };
  pick.height -= deadHeight;
  return pick;
}

async function launch() {
  return await puppeteer.launch({
    headless: true,
    defaultViewport: getRandomViewport(),
    args: [],
  });
}

async function withWebsite(todo: (page: puppeteer.Page) => Promise<void>) {
  const browser = await launch();

  const page = await browser.newPage();
  await page.setUserAgent(random(USER_AGENTS));
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
