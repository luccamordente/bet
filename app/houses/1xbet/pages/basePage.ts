import {Page} from "puppeteer";


export type Selectors = {[key:string]: string}

export default class BasePage {
  page: Page;
  url?: string;

  async goto() {
    if (this.url) {
      await this.page.goto(this.url);
    } else {
      throw new Error(`No url was passed to this page ${this.constructor.name}`)
    }    
  };

  constructor(page:Page, url?:string) {
    this.page = page;
    this.url = url;
  }

  // goto: function() {
    
  // }
}