//tslint:disable:strictNullChecks

import BasePage, {Selectors} from "./basePage";

export default class HomePage extends BasePage {

  footballCategoryParentSelector: 'ul.sport_menu li:first-child';

  selectors:Selectors = {
    footballCategory: 'ul.sport_menu li:first-child',
    filterDiv: 'div.ls-filter__name',
    hourlyFilterLink: 'div.ls-filter__wrap a.chosen-single',
    hourlyFilterOptions: 'div.ls-filter__wrap li.active-result',
    applyFilterButton: 'div.ls-filter__wrap button.ls-filter__btn',
    
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


  // async getBetsFromFootballEvent(event:Puppeeteer.element) {
  //   await delay(300);
  //   await event.click();
  //   await delay(300);

  //   const isValidMatch = await validateIfIsIndeedAMatch(page);
  //   if (!isValidMatch) {
  //     await event.evaluate((node) => {
  //       node.parentNode.removeChild(node);
  //     });
  //     continue;
  //   }

  //   const bets = await getEventBets(page);
  //   for (const bet of bets) {
  //     Object.assign(bet, { sport: 'Football', house: '1xBet' });
      
  //     // TODO send somewhere to be processed. maybe add to a queue?
  //     console.log(bet);
  //   }
    
  //   eventsUrls.push(await event.evaluate((node) => {
  //     const link = node.getAttribute('href');
  //     node.parentNode.parentNode.removeChild(node.parentNode);
  //     return link;
  //   }));
  // }

  async getFootballBets() {
    let bets = [];
    await this.page.waitFor(1000)
    const footballCategory = await this.page.$(this.footballCategoryParentSelector);
    
    await (await footballCategory.$('a')).click();
    

    await this.page.waitForSelector(this.footballCategoryParentSelector + " ul");
    
    

    const championships = await footballCategory.$$('ul > li');
    

    for( const championship of championships) {

      const championshipLink = await championship.$('a');
      await championshipLink.click();
      await this.page.waitForSelector(this.footballCategoryParentSelector + " ul > li ul ");

      const events = await championship.$$('ul.event_menu > li > a');
      
      for( const event of events) {

        // (await getBetsFromFootballEvent(event))

      }

      await championship.evaluate((node) => {
        node.parentNode.removeChild(node);
      });

      
    }
    console.timeEnd('scrap time');
    return bets;
  }
}