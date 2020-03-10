import {ElementHandle, errors} from "puppeteer";
import BasePage, {Selectors} from "./BasePage";

function getInnerText(node) { return node.innerText };

const MARKETS_WHITELIST = [
  'Total'
];

function isMarketWhitelisted(market) {
  return MARKETS_WHITELIST.includes(market);
}

export default class FootballMatchPage extends BasePage {


  selectors:Selectors = {
    scoreboardMainTitle: '.c-scoreboard__start--green',
    scoreboardTeamName: '.c-scoreboard-team__name',
    betGroup: '.bets > div:not(.bets__empty-cell)',
    betGroupsDiv: '.bet_group',

  }

  async validateIfIsIndeedAMatch() {
    // TODO stat time is not available in non match pages
    try {
      await this.page.waitForSelector(this.selectors.scoreboardMainTitle, {timeout: 800});
    } catch (e) {
      if (e instanceof errors.TimeoutError) {
        return false
      }
    }
    return true
  }

  async getTeamsData() {
    const teamsElements = await this.page.$$('.c-scoreboard-team__name');
    const teamsNames = [];

    for (const team of teamsElements) {
      teamsNames.push(await team.evaluate((node) => {
        return node.innerText;
      }));
    }

    return {
      home: teamsNames[0],
      away: teamsNames[1]
    };
  }

  async getMarketBets(betGroupElement) {
    const bets = [];

    const betsElements = await betGroupElement.$$(this.selectors.betGroup);
    
    for (const betElement of betsElements) {
      const title = await (await betElement.$('.bet_type')).evaluate(getInnerText);
      const odd = await (await betElement.$('.koeff')).evaluate(getInnerText);
      
      bets.push({
        title, 
        odd,
      });
    }

    return bets;
  }

  /**
   * Gets odds for all markets
   * @param {*} this.page 
   * @returns {Array} Array of odds
   */
  async getBets() {
    const betGroupsElements = await this.page.$$(this.selectors.betGroupsDiv);
    const odds = [];

    for (const betGroupElement of betGroupsElements) {
      const marketName = (await (await betGroupElement.$('.bet-title')).evaluate(getInnerText)).trim();
      if (isMarketWhitelisted(marketName)) {
        const marketBets = await this.getMarketBets(betGroupElement);
        for (const marketBet of marketBets) {
          odds.push(Object.assign({}, marketBet, { market: marketName }));
        }
      }
    }
    
    return odds;
  }

  async getStartTime() {
    // TODO stat time is not available in non match this.pages
    return await (await this.page.$(this.selectors.scoreboardMainTitle)).evaluate(getInnerText);
  }

  async getEventData() {
    const teams = await this.getTeamsData();
    const startTime = await this.getStartTime();

    return { teams, startTime };
  }

  /**
   * Get bets data. If any bets are found, we look for event data, then return all the bets,
   * augmented with that data.
   * @param {*} this.page 
   */
  async getEventBets() {
    const bets = await this.getBets();
    
    if (bets.length) {
      const event = await this.getEventData();
      for (const bet of bets) {
        Object.assign(bet, {event});
      }
    }

    return bets;
  }


}