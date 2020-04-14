import puppeteer from "puppeteer";

export async function hasClass(
  element: puppeteer.ElementHandle<any>,
  klass: string,
) {
  return (await element.evaluate(
    (el, selector) => el.classList.contains(selector),
    klass,
  )) as boolean;
}
