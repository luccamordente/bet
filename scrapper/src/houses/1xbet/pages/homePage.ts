import BasePage, {Selectors} from "./basePage";
import FootballMatchPage from "./footballMatchPage";
import {ElementHandle, errors} from "puppeteer";
import {Bet} from '../index';

export default class HomePage extends BasePage {

  selectors:Selectors = {
    footballCategory: 'ul.sport_menu li:first-child',
    filterDiv: 'div.ls-filter__name',
    hourlyFilterLink: 'div.ls-filter__wrap a.chosen-single',
    hourlyFilterOptions: 'div.ls-filter__wrap li.active-result',
    applyFilterButton: 'div.ls-filter__wrap button.ls-filter__btn',
    footballCategoryParentSelector: 'ul.sport_menu li:first-child'
  }

  async setEventFilterTo12Hours() {
    const filterDiv = await this.page.$(this.selectors.filterDiv);
    if (filterDiv == null) {
      throw new Error('object filterDiv is null on setEventFilterToHours');
    } else {
      await filterDiv.click();
    }

    await this.page.waitFor(2000);

    const hourlyFilterLink = await this.page.$(this.selectors.hourlyFilterLink);
    if (hourlyFilterLink == null) {
      throw new Error('object hourlyFilterLink is null on setEventFilterToHours');
    } else {
      await hourlyFilterLink.click();
    }
    await this.page.waitFor(100)

    const hourlyFilterOptions = await this.page.$$(this.selectors.hourlyFilterOptions);
    if (hourlyFilterOptions == null) {
      throw new Error('object hourlyFilterOptions is null on setEventFilterToHours');
    } else {
      await hourlyFilterOptions[3].click();
    }

    await this.page.waitFor(100)
    const applyFilterButton = await this.page.$(this.selectors.applyFilterButton);
    if (applyFilterButton == null) {
      throw new Error('object applyFilterButton is null on setEventFilterToHours');
    } else {
      await applyFilterButton.click();
    }
  }


async getBetsFromFootballEvent(event:ElementHandle):Promise<Bet[]> {
    // FIXME change waitFor's to use something other than time
    await this.page.waitFor(100);
    try {
      await event.click();
    } catch(e) {
      await this.page.waitFor(333300);
    }

    await this.page.waitFor(300);

    const matchPage = new FootballMatchPage(this.page, this.page.url());
    const extractTime = new Date();

    const isValidMatch = await matchPage.validateIfIsIndeedAMatch();
    if (!isValidMatch) {
      await event.evaluate((node) => {
        node.parentNode.removeChild(node);
      });
      return [];
    }

    const bets = await matchPage.getEventBets();
    for (const bet of bets) {
      Object.assign(bet, { sport: 'football', extractTime });
    }

    return bets;
  }

  async *getFootballBets() {
    const bets = [];
    const footballCategory = await this.page.$(this.selectors.footballCategoryParentSelector);
    const footballCategoryLink = await footballCategory.$('a')
    await this.setEventFilterTo12Hours();
    await this.page.waitFor(3000)

    await footballCategoryLink.click();

    await this.page.waitForSelector(this.selectors.footballCategoryParentSelector + " ul");

    const championships = await footballCategory.$$('ul > li');

    for(const championship of championships) {

      const championshipLink = await championship.$('a');
      await championshipLink.click();
      try {
        await this.page.waitForSelector(this.selectors.footballCategoryParentSelector + " ul > li ul ");
      } catch(e) {
        if (e instanceof errors.TimeoutError) {
          console.warn("! 1XBET: timeout waiting for football category parent selector.");
          return;
        }
      }

      const events = await championship.$$('ul.event_menu > li > a');

      for(const event of events) {
        const eventBets = await this.getBetsFromFootballEvent(event);

        for (const bet of eventBets) {
          yield bet;
        }
      }

      await championship.evaluate((node) => {
        node.parentNode.removeChild(node);
      });
    }
  }
}