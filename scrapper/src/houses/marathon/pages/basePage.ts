import { Page } from "puppeteer";

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

  protected abstract async getContent(): Promise<string>;

  protected abstract parseContent(): Promise<DataType>;

  protected abstract prepareData(data: DataType): PreparedDataType;

  public async getData(): Promise<PreparedDataType | undefined> {
    let data;
    try {
      const content = await this.getContent();
      await this.appendContent(content);
      data = await this.parseContent();
    } catch(e) {
      console.error("Error getting data", e.message, e.stack);
      return;
    } finally {
      try {
        await this.destroyContent();
      } catch(e2) {
        console.error("Error destroying content", e2.message, e2.stack);
      }
    }
    return this.prepareData(data);
  }

}