import axios from 'axios';
import { parse as parseHTML } from 'node-html-parser';

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

class FootballMatchPage {
  private url: string;
  private root: any;

  private selectors = {
    memberName: '.member-area-content-table .member-link',
    date: '.member-area-content-table .date',
    bet: '.price',
    sport: '.sport-category-label',
  };

  constructor(url:string) {
    this.url = url;
  }

  private parseDate(): string {
    return this.root.querySelector(this.selectors.date).text.trim();
  }

  private parseMembers(): Members {
    const elements = this.root.querySelectorAll(this.selectors.memberName);
    const names = elements.map(e => e.text.trim());
    const [home, away] = names;
    return {home, away};
  }

  private filterPrices(prices: Price[]): Price[] {
    return prices.filter(price => {
      return filterMarket(price.mn, price.sn);
    });
  }

  private parsePrices(): Price[] {
    const nodes = this.root.querySelectorAll(this.selectors.bet);
    const prices: Price[] = [];
    for (const node of nodes) {
      const priceData = node.getAttribute('data-sel');
      if (priceData) {
        const {sn, mn, epr} = JSON.parse(priceData);
        prices.push({sn, mn, epr});
      }
    }
    return this.filterPrices(prices);
  }

  private async getContent(): Promise<types.Content> {
    const url = new URL(this.url);
    // Apparently match pages don't have pagination
    url.searchParams.append('pageAction', 'default');

    const response = await axios.get<Response>(url.toString(), {
      headers: {
        Cookie: 'timezone = Atlantic_Azores;path=/'
      },
      timeout: 10000,
    });
    const [,{content}] = response.data;

    return {
      content,
      hasNextPage: false,
    };
  }

  private parseContent(): FootballMatchData {
    const date = this.parseDate();
    const members = this.parseMembers();
    const prices = this.parsePrices();

    const data = {
      date,
      members,
      prices,
    };
    return data;
  }

  private prepareData(data): FootballMatchPageData {
    return Object.assign(data, {
      url: this.url,
    });
  }

  public async *getData(): AsyncGenerator<FootballMatchPageData> {
    try {
      const content = await this.getContent();
      this.root = parseHTML(content.content);
      const data = this.parseContent();
      yield this.prepareData(data);
    } catch(e) {
      console.error("Error getting data", e.message, e.stack);
    }
  }

}

export default FootballMatchPage;