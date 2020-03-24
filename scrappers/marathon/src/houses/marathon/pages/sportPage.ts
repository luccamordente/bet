import puppeteer from 'puppeteer';
import axios from 'axios';

import BasePage from './basePage';

declare const window: {
  location: {
    origin: string,
  },
};

interface Sport {
  urls: string[],
};

class SportPage extends BasePage<Sport, Sport> {

  private selectors = {
    link: '.member-area-content-table .member-link',
  };

  protected async getContent(): Promise<string> {
    // This makes the content smaller
    const url = `${this.url}&pageAction=default`;
    const response = (await axios.get(url)).data;

    return response[0].content;
  }

  private async parseUrls(): Promise<string[]> {
    const urls = await this.page.$$eval(this.selectors.link, (nodes) => {
      return nodes.map(node => {
        return window.location.origin + node.getAttribute('href');
      })
    }) as unknown as string[];
    return [... new Set(urls)];
  }

  protected async parseContent(): Promise<Sport> {
    const urls = await this.parseUrls();
    return { urls };
  }

  protected prepareData(data: Sport): Sport {
    return data;
  }

}

export default SportPage;