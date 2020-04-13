import puppeteer from "puppeteer";

export interface Data {
  sportName?: string;
  leagueName?: string;
  eventDate?: string;
  eventTime?: string;
  eventParticipants?: [string, string];
  marketGroup?: string;
  marketName?: string;
  marketMatrix?: unknown;
}

export interface Egg {
  data: Data;
  page: puppeteer.Page;
  element?: puppeteer.ElementHandle;
}
