import axios from 'axios';

import { getInnerText } from '../../../utils/pageHelpers';
import BasePage from './basePage';

export type Members = {
  home: string,
  away: string,
};

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

const MARKETS_WHITELIST = [
  'Total Goals',
  // 'Total Maps',
  'Total Points',
];

function isMarketWhitelisted(market) {
  return MARKETS_WHITELIST.includes(market);
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
      return isMarketWhitelisted(price.mn)
        && price.sn.match(/(Over|Under)/) !== null;
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

  protected async getContent(): Promise<string | undefined> {
    // This makes the content smaller
    const url = `${this.url}?pageAction=default`;
    const response = (await axios.get(url)).data;

    return response[1].content;
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