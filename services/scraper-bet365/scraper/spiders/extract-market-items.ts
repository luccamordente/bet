import puppeteer from "puppeteer";
import { Data } from "../types";

import em from "../utils/events";

interface MarketGroupObject {
  headers: readonly string[];
  labels: readonly string[];
  values: readonly {
    handicap: string | null;
    name: string | null;
    odds: string;
  }[];
}

/**
 * Gets the text content of the first child element of the `parent`
 * element containing `klass` in any of it's classes.
 * @param parent The parent element in which to search for a child.
 * @param klass The class substring to use to find the child.
 * @returns Either `null` if no child is found or a string with the
 * text content of the first child
 */
async function textContentContainingClass(
  parent: puppeteer.ElementHandle,
  klass: string,
) {
  const element = (await parent.$x(`span[contains(@class,'${klass}')]`))[0];
  if (element == null) {
    return null;
  }
  const content = await element.evaluate((el) => el.textContent);
  return content;
}

/**
 * Denormalizes a market group object representation into an
 * array of market items.
 * @param object Market Group object representation
 */
function marketGroupObjectToItems(object: MarketGroupObject) {
  const { headers, labels, values } = object;

  const items = [];

  for (let index = 0; index < values.length; index++) {
    const linesCount = values.length / headers.length;

    const value = values[index];
    const header = headers[Math.floor(index / linesCount)];
    const label = labels[index % labels.length];

    items.push({
      value,
      ...{ header: header != null ? header : null },
      ...{ label: label != null ? label : null },
    });
  }

  return items;
}

/**
 * Creates a simple object representation of the market group element.
 * @param element Element to transfor into an object.
 */
async function marketGroupToObject(element: puppeteer.ElementHandle) {
  const headers = ((await element.$$eval(".gl-MarketColumnHeader", (els) =>
    els.map((el) => el.textContent).filter((s) => s.trim().length > 0),
  )) as unknown) as string[];

  const labels = ((await element.$$eval(".srb-ParticipantLabel", (els) =>
    els.map((el) => el.textContent),
  )) as unknown) as string[];

  const cells = await element.$$(".gl-Participant_General");

  const values = [];
  for (const cell of cells) {
    const handicap = await textContentContainingClass(cell, "_Handicap");
    const name = await textContentContainingClass(cell, "_Name");
    const odds = await textContentContainingClass(cell, "_Odds");
    values.push({ handicap, name, odds });
  }

  return {
    headers,
    labels,
    values,
  };
}

/**
 * Orchestrate the functions that will transform a market group
 * element into an array of market items.
 * @param element Element to transform to items.
 */
async function marketGroupElementToItems(element: puppeteer.ElementHandle) {
  const marketGroupObject = await marketGroupToObject(element);
  return marketGroupObjectToItems(marketGroupObject);
}

/**
 * Receives a market group element and extract data in it.
 * Since we have the reference for the element and will not change
 * pages anymore, we only need the elmenet and the data object to
 * extend and pass along.
 */
async function run(egg: {
  data: Partial<Data>;
  element: puppeteer.ElementHandle;
}) {
  const { data, element } = egg;

  const marketItems = await marketGroupElementToItems(element);

  for (const marketItem of marketItems) {
    em.emit("data", {
      ...data,
      market: marketItem,
    });
  }
}

export default run;
