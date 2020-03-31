import axios from 'axios';
import { URL } from "url";
import { parse as parseHTML } from 'node-html-parser';

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

class SportPage {
  private url: string;
  private root: any;

  private selectors = {
    link: '.member-area-content-table .member-link',
  };

  constructor(url:string) {
    this.url = url;
  }

  private async getContent(page: number): Promise<types.Content> {
    const url = new URL(this.url);
    url.searchParams.append('pageAction', 'getPage');
    url.searchParams.append('page', `${page}`);

    const response = await axios.get<Response>(url.toString(), { timeout: 10000 });
    const [{content}, {val: hasNextPage}] = response.data;

    return {
      content,
      hasNextPage,
    };
  }

  private parseContent(): string[] {
    const origin = new URL(this.url).origin;
    const urls = this.root.querySelectorAll(this.selectors.link).map(node => {
      return origin + node.getAttribute('href');
    }) as unknown as string[];
    return [... new Set(urls)];
  }


  public async getData(): Promise<Sport> {
    const data: Sport = { urls: [] };
    try {
      let hasNextPage = true;
      let pageNumber = 0;

      while (hasNextPage) {
        const content = await this.getContent(pageNumber);
        this.root = parseHTML(content.content);
        const parsed = this.parseContent();

        hasNextPage = content.hasNextPage;
        data.urls = data.urls.concat(parsed);

        pageNumber++;
      }
    } catch(e) {
      console.error("Error getting data", e.message, e.stack);
    }
    return data;
  }

}

export default SportPage;