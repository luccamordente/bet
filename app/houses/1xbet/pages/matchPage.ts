import {ElementHandle} from "puppeteer";
import BasePage, {Selectors} from "./basePage";

export default class MatchPage extends BasePage {

  selectors:Selectors = {

  }

  async getBetsFromFootballEvent(event:ElementHandle) {
    await this.page.waitFor(300);
    await event.click();
    await this.page.waitFor(300);

    const isValidMatch = await validateIfIsIndeedAMatch();
    if (!isValidMatch) {
      await event.evaluate((node) => {
        node.parentNode.removeChild(node);
      });
      return null;
    }

    const bets = await getEventBets(page);
    for (const bet of bets) {
      Object.assign(bet, { sport: 'Football', house: '1xBet' });
      
      // TODO send somewhere to be processed. maybe add to a queue?
      console.log(bet);
    }
    
    eventsUrls.push(await event.evaluate((node) => {
      const link = node.getAttribute('href');
      node.parentNode.parentNode.removeChild(node.parentNode);
      return link;
    }));
  }

}