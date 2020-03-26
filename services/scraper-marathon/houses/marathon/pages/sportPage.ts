import axios from 'axios';
import { URL } from "url";

import BasePage from './basePage';
import * as types from "./types";

declare const window: {
  location: {
    origin: string,
  },
};

interface ReponseContent {
  selector: 'nextPageContent',
  content: string,
};

interface ResponseProp {
  prop: string,
  val: any,
}

type Response = [ReponseContent, ResponseProp];

interface Sport {
  urls: string[],
};

class SportPage extends BasePage<Sport, Sport> {

  private selectors = {
    link: '.member-area-content-table .member-link',
  };

  protected async getContent(page: number): Promise<types.Content> {
    const url = new URL(this.url);
    url.searchParams.append('pageAction', 'getPage');
    url.searchParams.append('page', `${page}`);

    const response = await axios.get<Response>(url.toString());
    const [{content}, {val: hasNextPage}] = response.data;

    return {
      content,
      hasNextPage,
    };
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