import puppeteer from "puppeteer";

// Market Value

interface GenericMarketValue {
  handicap: string | null;
  name: string | null;
  odds: string;
}

interface NamedMarketValue extends GenericMarketValue {
  handicap: null;
  name: string;
  odds: string;
}

interface HandicapMarketValue extends GenericMarketValue {
  handicap: string;
  name: null;
  odds: string;
}

interface OddsOnlyMarketValue extends GenericMarketValue {
  handicap: null;
  name: null;
  odds: string;
}

// Market

interface GenericMarket {
  header: string | null;
  label: string | null;
  value: GenericMarketValue;
}

interface SimpleWinnerMarket extends GenericMarket {
  header: null;
  label: null;
  value: NamedMarketValue;
}

interface HeaderOnlyMarket extends GenericMarket {
  header: string;
  label: null;
  value: NamedMarketValue;
}

interface CompleteHandicapMarket extends GenericMarket {
  header: string;
  label: string;
  value: HandicapMarketValue;
}

interface CompleteOddsOnlyMarket extends GenericMarket {
  header: string;
  label: string;
  value: OddsOnlyMarketValue;
}

// Data

export interface GenericData {
  sportName: string;
  leagueName: string;
  eventStartTime: Date;
  eventParticipants: [string, string];
  marketGroup: string;
  market: GenericMarket;
  url: string;
}

export interface SimpleWinnerData extends Required<GenericData> {
  market: SimpleWinnerMarket;
}

export interface HeaderOnlyData extends Required<GenericData> {
  market: HeaderOnlyMarket;
}

export interface CompleteHandicapData extends Required<GenericData> {
  market: CompleteHandicapMarket;
}

export interface CompleteOddsOnlyData extends Required<GenericData> {
  market: CompleteOddsOnlyMarket;
}

export type Data =
  | SimpleWinnerData
  | HeaderOnlyData
  | CompleteHandicapData
  | CompleteOddsOnlyData;

export interface Egg {
  data: Partial<Data>;
  page: puppeteer.Page;
  /** XPath to be used by spiders to narrow search */
  xpath?: string;
}
