import puppeteer from 'puppeteer';
import moment from 'moment';

import { save as saveBettable, Bettable } from '../../models/bettable';

import SportPage from './pages/sportPage';
import FootballMatchPage, { Members, Price } from './pages/footballMatchPage';

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
  // { key: 'esports', id: 1895085 },
  { key: 'soccer', id: 11, },
  { key: 'hockey', id: 537, },
  // { key: 'tabletennis', id: 382549, },
  // { key: 'tennis', id: 2398, },
];
const TIME_SPAN_HOURS = 24;


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

function normalizeBet(bet: Bet): Bettable {
  const [,operator, value] = bet.price.sn.match(/(\w+)\s+([\d\.]+)/);
  return {
    odd: parseFloat(bet.price.epr),
    market: {
      key: "total_points",
      type: "over_under",
      operation: {
        operator: operator === 'Under' ? 'under' : 'over',
        value: parseFloat(value),
      },
    },
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

    console.log(`💾 Marathon ${bettable.sport} ${Math.round(bettable.odd*100)/100} ${moment(bettable.event.starts_at).format('DD/MM hh:mm')}`);
    saveBettable(bettable).catch( error => {
      console.error(error);
    });
    savedCount++;
  }

  return savedCount;
}