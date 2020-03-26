import { Page } from "puppeteer";
import * as types from "./types";

declare const document: {
  createElement: (content: string) => any,
};

export default abstract class BasePage<DataType, PreparedDataType> {
  protected page: Page;
  protected url: string;
  protected appendId: string;

  constructor(page:Page, url:string) {
    this.page = page;
    this.url = url;
    this.appendId = `#wrapper-${Math.round(Math.random()*1000000000)}`;
  }

  protected async appendContent(content: string): Promise<void> {
    const body = await this.page.$('body');
    const id = this.appendId.replace('#','');

    await this.page.evaluate((bodyHandle, appendContent, wrapperId) => {
      const wrappedContent = `<div id="${wrapperId}">${appendContent}</div>`;
      const el = document.createElement('div');
      el.innerHTML = wrappedContent;
      bodyHandle.appendChild(el);
    }, body, content, id);
  }

  protected async destroyContent(): Promise<void> {
    const wrapper = await this.page.$(this.appendId);
    await wrapper.evaluate((node) => {
      node.parentNode.removeChild(node);
    });
  }
  
  protected abstract async getContent(page: number): Promise<types.Content>;

  protected abstract parseContent(): Promise<DataType>;

  protected abstract prepareData(data: DataType): PreparedDataType;

  public async *getData(): AsyncGenerator<PreparedDataType> {
    let data;
    try {
      let hasNextPage = true;
      let pageNumber = 0;

      while (hasNextPage) {
        const content = await this.getContent(pageNumber);

        await this.appendContent(content.content);
        data = await this.parseContent();
        await this.destroyContent();

        hasNextPage = content.hasNextPage;
        yield this.prepareData(data);
        pageNumber++;

      }
    } catch(e) {
      console.error("Error getting data", e.message, e.stack);
    }

  }

}