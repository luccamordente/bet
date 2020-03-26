import axios from 'axios';

import { getInnerText } from '../../../utils/pageHelpers';
import BasePage from './basePage';

import { MarketName } from '../types';
import * as types from "./types";
import { URL } from 'url';

export type Members = {
  home: string,
  away: string,
};

interface ReponseContent<Selector> {
  selector: Selector,
  content: string,
};

interface ResponseProp {
  prop: string,
  val: any,
}

type Response = [
  ReponseContent<'#footerLinks'>,
  ReponseContent<'#events_content'>,
  ResponseProp,
  ResponseProp,
  ResponseProp,
  ResponseProp,
  ResponseProp,
  ResponseProp,
];

interface FootballMatchData {
  members: Members,
  date: string,
  prices: Price[],
}

interface FootballMatchPageData extends FootballMatchData {
  url: string,
};

/**
 * Example string:
 * {"sn":"Under 3.5","mn":"Total Goals","ewc":"1/1 1","cid":51448346250,"prt":"CP","ewf":"1.0","epr":"1.27","prices":{"0":"27/100","1":"1.27","2":"-371","3":"0.27","4":"0.27","5":"-3.71"}}
 */
export interface Price {
  sn: string,  // ??
  mn: string,  // Market Name
  epr: string, // E? Price
};

export function assertMarket(marketName: never): boolean {
  return false;
}

function filterMarket(mn: string, sn: string): boolean {
  const marketName = mn as MarketName;

  switch (marketName) {
    case MarketName.TOTAL_GOALS:
    case MarketName.TOTAL_POINTS:
    case MarketName.TOTAL_MAPS:
      return sn.match(/(Over|Under)/) !== null;

    case MarketName.TO_WIN_MATCH_WITH_HANDICAP:
    case MarketName.TO_WIN_MATCH_WITH_HANDICAP_BY_MAPS:
      return true;

    default:
      return assertMarket(marketName);
  }
}

class FootballMatchPage extends BasePage<FootballMatchData, FootballMatchPageData> {

  selectors = {
    memberName: '.member-area-content-table .member-link',
    date: '.member-area-content-table .date',
    bet: '.price[data-sel]',
    sport: '.sport-category-label',
  };

  private async parseDate(): Promise<string> {
    return await (await this.page.$(this.selectors.date)).evaluate(getInnerText);
  }

  private async parseMembers(): Promise<Members> {
    const elements = await this.page.$$(this.selectors.memberName);
    const names = [];
    for (const element of elements) {
      names.push(await element.evaluate(getInnerText));
    }
    const [home, away] = names;
    return {home, away};
  }

  private filterPrices(prices: Price[]): Price[] {
    return prices.filter(price => {
      return filterMarket(price.mn, price.sn);
    });
  }

  private async parsePrices(): Promise<Price[]> {
    const prices = await this.page.$$eval(this.selectors.bet, (nodes) => {
      return nodes.map(node => {
        const {sn, mn, epr} = JSON.parse(node.getAttribute('data-sel')) as Price;
        return {sn, mn, epr};
      })
    }) as unknown as Price[];
    return this.filterPrices(prices);
  }

  protected async getContent(page: number): Promise<types.Content> {
    const url = new URL(this.url);
    // Apparently match pages don't have pagination
    url.searchParams.append('pageAction', 'default');

    const response = await axios.get<Response>(url.toString());
    const [,{content}] = response.data;

    return {
      content,
      hasNextPage: false,
    };
  }

  protected async parseContent(): Promise<FootballMatchData> {
    const date = await this.parseDate();
    const members = await this.parseMembers();
    const prices = await this.parsePrices();

    const data = {
      date,
      members,
      prices,
    };
    return data;
  }

  protected prepareData(data): FootballMatchPageData {
    return Object.assign(data, {
      url: this.url,
    });
  }
}

export default FootballMatchPage;