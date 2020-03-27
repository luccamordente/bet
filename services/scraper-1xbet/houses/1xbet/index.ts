import puppeteer from 'puppeteer';
import { save as saveBettable, Bettable } from '../../models/bettable';
import HomePage from './pages/homePage';
import moment from 'moment';

export type Market = "Total" // | 'others'

export interface Teams {
  readonly home: string;
  readonly away: string;
}

export interface Event {
  readonly teams: Teams;
  readonly startTime: string;
};

export interface Bet {
  readonly title: string;
  readonly odd: string;
  readonly market: Market;
  readonly event: Event;
  readonly sport: "Football";
  readonly extractTime: Date;
  readonly url: string;
};

async function* retriveBets() {
  let browser: puppeteer.Browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
        defaultViewport: { width: 1900, height: 10900},
        args: [],
    });
    const page = (await browser.pages())[0];
    const homepage = new HomePage(page, "https://br.1xbet.com/" );
    await homepage.goto();

    yield* homepage.getFootballBets();
  } catch(e) {
    console.error(e);
  } finally {
    browser.close();
  }
}


function normalizeBet(bet: Bet): Bettable {
  return {
    odd: parseFloat(bet.odd),
    market: {
      key: "game_score_total",
      type: "over_under",
      operation: {
        operator: bet.title.includes('Over') ? 'over' : 'under',
        value: parseFloat(bet.title.match(/\d+(\.\d+)?/)[0])
      },
    },
    house: "1xbet",
    sport: "soccer",
    event: {
      league: 'n/a',
      starts_at: moment(bet.event.startTime, "DD.MM.YYYY HH:mm").toDate(),
      participants: {
        home: bet.event.teams.home,
        away: bet.event.teams.away,
      },
    },
    extracted_at: bet.extractTime,
    url: bet.url,
  };
}

export default async function retriveBetsAndUpdateDb():Promise<number> {
  let savedCount = 0;

  for await (const bet of retriveBets()) {
    if (typeof bet !== 'object') {
      continue;
    }
    const bettable = normalizeBet(bet);

    console.log(`💾 1XBET ${bettable.sport} ${bettable.market.key} (${bettable.market.operation.operator} ${bettable.market.operation.value} ⇢ ${Math.round(bettable.odd*100)/100}) ${moment(bettable.event.starts_at).format('DD/MM hh:mm')}`);
    saveBettable(bettable).catch( error => {
      console.error(error);
    });
    savedCount++;
  }

  return savedCount;
}