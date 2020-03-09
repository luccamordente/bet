// @ts-nocheck

import puppeteer from 'puppeteer';
import { save as saveBettables, Bettable } from '../models/bettable';
import HomePage from './pages/homePage';

const CONCURRENT_CHROMIUM_TABS = 4;

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

function getInnerText(node) { return node.innerText }

const MARKETS_WHITELIST = [
  'Total'
];

async function retriveBets() {
  console.time('scrap time');
  
  let browser: puppeteer.Browser;

  try {
    browser = await puppeteer.launch({
      headless: false,
        defaultViewport: { width: 1900, height: 1900},
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = (await browser.pages())[0];
    const homepage = new HomePage(page, "https://br.1xbet.com/" );
    
    await homepage.goto();

    await homepage.setEventFilterTo12Hours();

    await delay(3000);

    const bets = await homepage.getFootballBets();
  } catch(e) {
    console.error(e);
  } finally {
    browser.close();
  }

}

async function getTeamsData(page) {
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

function isMarketWhitelisted(market) {
  return MARKETS_WHITELIST.includes(market);
}

async function getMarketBets(betGroupElement) {
  const bets = [];

  const betsElements = await betGroupElement.$$('.bets > div:not(.bets__empty-cell)');
  
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
 * @param {*} page 
 * @returns {Array} Array of odds
 */
async function getBets(page) {
  const betGroupsElements = await this.page.$$('.bet_group');
  const odds = [];

  for (const betGroupElement of betGroupsElements) {
    const marketName = (await (await betGroupElement.$('.bet-title')).evaluate(getInnerText)).trim();
    if (isMarketWhitelisted(marketName)) {
      const marketBets = await getMarketBets(betGroupElement);
      for (const marketBet of marketBets) {
        odds.push(Object.assign({}, marketBet, { market: marketName }));
      }
    }
  }
  
  return odds;
}

async function validateIfIsIndeedAMatch(page) {
  // TODO stat time is not available in non match pages
  try {
    await this.page.waitForSelector('.c-scoreboard__start--green', {timeout: 800});
  } catch (e) {
    if (e instanceof puppeteer.errors.TimeoutError) {
      return false
    }
  }
  return true
}

async function getStartTime(page) {
  // TODO stat time is not available in non match pages
  return await (await this.page.$('.c-scoreboard__start--green')).evaluate(getInnerText);
}

async function getEventData(page) {
  const teams = await getTeamsData(page);
  const startTime = await getStartTime(page);

  return { teams, startTime };
}

/**
 * Get bets data. If any bets are found, we look for event data, then return all the bets,
 * augmented with that data.
 * @param {*} page 
 */
async function getEventBets(page) {
  const bets = await getBets(page);
  
  if (bets.length) {
    const event = await getEventData(page);
    for (const bet of bets) {
      Object.assign(bet, {event});
    }
  }

  return bets;
}

export default async function retriveBetsAndUpdateDb() {
  
  const bets = await retriveBets();
  
}

