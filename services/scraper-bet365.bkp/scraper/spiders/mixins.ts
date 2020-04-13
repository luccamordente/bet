import puppeteer from "puppeteer";

type Spider = (page: puppeteer.Page) => Promise<void>;

/**
 * Makes a spider go back to it's original url after it finishes running.
 * @param spider The spider to make to want to go back home.
 */
export function homie(spider: Spider) {
  return async (page: puppeteer.Page, ...etc) => {
    const url = page.url();
    await spider.apply(spider, [page, ...etc]);

    if (url != page.url()) {
      await page.goto(url);
    }
  };
}
