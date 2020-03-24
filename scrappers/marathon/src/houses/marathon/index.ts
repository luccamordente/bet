import puppeteer from 'puppeteer';
import moment from 'moment';

import { save as saveBettable, Bettable, BettableMarket, MarketType } from '../../models/bettable';

import SportPage from './pages/sportPage';
import FootballMatchPage, { Members, Price } from './pages/footballMatchPage';
import { normalizedMarketKey } from './types';
import { sanitizedEquals } from '../../utils';

export interface Bet {
  sport: string,
  members: Members,
  date: string,
  url: string,
  price: Price,
  extractTime: Date,
};

declare const document: {
  body: {
    innerHTML: string,
  },
};

const SPORTS = [
  { key: 'basketball', id: 6, },
  { key: 'esports', id: 1895085 },
  { key: 'soccer', id: 11, },
  { key: 'hockey', id: 537, },
  // { key: 'tabletennis', id: 382549, },
  // { key: 'tennis', id: 2398, },
];
const TIME_SPAN_HOURS = 24 * 5;


class MarathonWebsite {

  async *retrieveBets(): AsyncGenerator<Bet> {
    let browser: puppeteer.Browser;
    try {
      browser = await this.launch();
      const page = await browser.newPage();

      // Load any page
      await page.goto('https://www.marathonbet.com/pt/betting/11?periodGroupAllEvents=0');
      await page.evaluate(() => document.body.innerHTML = "" );

      for (const sport of SPORTS) {
        const footballPage = new SportPage(page, `https://www.marathonbet.com/pt/betting/${sport.id}?periodGroupAllEvents=${TIME_SPAN_HOURS}`);
        const urls = (await footballPage.getData()).urls;

        for (const url of urls) {
          const footballMatchPage = new FootballMatchPage(page, url);
          const data = await footballMatchPage.getData();
          if (data === undefined) {
            continue;
          }
          const extractTime = new Date();

          for (const price of data.prices) {

            const bet: Bet = {
              sport: sport.key,
              members: data.members,
              date: data.date,
              url: data.url,
              extractTime,
              price
            }
            yield bet;
          }
        }
      }
    } catch(error) {
      console.log(error);
    } finally {
      browser.close();
    }
  };

  private launch(): Promise<puppeteer.Browser> {
    return puppeteer.launch({
      headless: true,
        defaultViewport: { width: 1900, height: 5000},
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
}

function normalizeDate(date: string): Date {
  const parts = date.trim().split(/\s+/);
  if (parts.length === 3) {
    return moment(date, 'D MMM HH:mm').toDate();
  } else if (parts.length === 1) {
    return moment(date, 'HH:mm').toDate();
  }
  throw new Error(`Cannot normalize date: ${date}`);
}

function normalizeMarket(bet: Bet): BettableMarket {
  let member: string;
  let value: string;
  let operator;
  let type: MarketType;
  const key = normalizedMarketKey(bet.price.mn);

  switch (key) {
    case 'game_score_total':
      [, operator, value] = bet.price.sn.match(/(\w+)\s+([\d\.]+)/);
      operator = operator === 'Under' ? 'under' : 'over';
      type = 'over_under';

      return {
        key,
        type: "over_under",
        operation: {
          operator,
          value: parseFloat(value),
        },
      }

    case 'game_score_handicap':
      [, member, value] = bet.price.sn.match(/(.*) \(([+-]?[\d\.]+)\)/);

      if (sanitizedEquals(bet.members.home, member)) {
        operator = 'home';
      } else if (sanitizedEquals(bet.members.away, member)) {
        operator = 'away';
      } else {
        throw new Error(`Member '${member}' in price.sn '${bet.price.sn}' doesn't match any of the extracted members in ${JSON.stringify(bet.members)}`);
      }

      return {
        key,
        type: "spread",
        operation: {
          operator,
          value: parseFloat(value),
        },
      }

    default:
      throw new Error(`Market key '${key}' not found!`);
  }
}

function normalizeBet(bet: Bet): Bettable {
  return {
    odd: parseFloat(bet.price.epr),
    market: normalizeMarket(bet),
    house: "marathon",
    sport: bet.sport.toLowerCase().replace(/[^a-z]/g, ''),
    event: {
      league: null,
      starts_at: normalizeDate(bet.date),
      participants: {
        home: bet.members.home,
        away: bet.members.away,
      },
    },
    extracted_at: bet.extractTime,
    url: bet.url,
  };
}

export default async function retriveBetsAndUpdateDb():Promise<number> {
  let savedCount = 0;

  const website = new MarathonWebsite();
  for await (const bet of website.retrieveBets()) {
    const bettable = normalizeBet(bet);

    console.log(`💾 Marathon ${bettable.sport} ${bettable.market.key} (${bettable.market.operation.operator} ${bettable.market.operation.value} ⇢ ${Math.round(bettable.odd*100)/100})  ${moment(bettable.event.starts_at).format('DD/MM hh:mm')}`);
    saveBettable(bettable).catch( error => {
      console.error(error);
    });
    savedCount++;
  }

  return savedCount;
}