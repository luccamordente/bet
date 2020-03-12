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
  readonly sport: "Football"
};

async function retriveBets():Promise<Bet[]> {
  let browser: puppeteer.Browser;
  let bets = [];
  try {
    browser = await puppeteer.launch({
      headless: true,
        defaultViewport: { width: 1900, height: 10900},
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = (await browser.pages())[0];
    const homepage = new HomePage(page, "https://br.1xbet.com/" );
    await homepage.goto();

    bets = await homepage.getFootballBets();
  } catch(e) {
    console.error(e);
  } finally {
    browser.close();
  }
  return bets;
}


function normalizeBets(bets: Bet[]): Bettable[] {
  return bets.map((bet) => {
    return {
      odd: parseFloat(bet.odd),
      market: {
        key: "total_points",
        type: "over_under",
        operation: {
          operator: bet.title.includes('Over') ? 'over' : 'under',
          value: parseFloat(bet.title.match(/\d+(\.\d+)?/)[0])
        },
      },
      house: "1xbet",
      sport: "football",
      event: {
        league: 'n/a',
        starts_at: moment(bet.event.startTime, "DD.MM.YYYY HH:mm").toDate(), // TODO check timezone from container browser
        participants: {
          home: bet.event.teams.home,
          away: bet.event.teams.away,
        },
      },
    };
  });
}

export default async function retriveBetsAndUpdateDb() {
  console.time('scrap time');
  let bets = await retriveBets();
  console.timeEnd('scrap time');
  bets = bets.filter(n => n);
  console.log(bets.length, 'bets found.');
  const bettables = normalizeBets(bets);

  console.time('save time');
  for (const bettable of bettables) {
    saveBettable(bettable).catch( error => {
      console.error(error);
    });
  }
  console.timeEnd('save time'); 
  
}