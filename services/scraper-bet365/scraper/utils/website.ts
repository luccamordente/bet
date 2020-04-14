import puppeteer from "puppeteer";

async function launch() {
  return await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1900, height: 9900 },
    args: [],
  });
}

async function withWebsite(todo: (page: puppeteer.Page) => void) {
  const browser = await launch();

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:68.0) Gecko/20100101 Firefox/68.0",
  );
  await page.goto("https://www.68365365.com/");

  try {
    await todo(page);
  } catch (error) {
    browser.close();
    throw error;
  }

  browser.close();
}

export default withWebsite;
