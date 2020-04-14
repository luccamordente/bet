import puppeteer from "puppeteer";

export interface Data {
  sportName?: string;
  leagueName?: string;
  eventDate?: string;
  eventTime?: string;
  eventParticipants?: [string, string];
  marketGroup?: string;
  marketMatrix?: unknown;
  url?: string;
}

export interface Egg {
  data: Data;
  page: puppeteer.Page;
  /** XPath to be used by spiders to narrow search */
  xpath?: string;
}
