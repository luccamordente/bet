import puppeteer from "puppeteer";

async function launch() {
  return await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1900, height: 1900 },
    args: [],
  });
}

async function withWebsite(todo: (page: puppeteer.Page) => void) {
  const browser = await launch();

  const page = await browser.newPage();
  await page.goto("https://www.bet365.com/");

  try {
    await todo(page);
  } catch (error) {
    browser.close();
    throw error;
  }

  browser.close();
}

export default withWebsite;
