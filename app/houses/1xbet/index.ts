import puppeteer from 'puppeteer';
import { save as saveBettables, Bettable } from '../../models/bettable';
import HomePage from './pages/homePage';

async function retriveBets():Promise<any[]> {
  
  let browser: puppeteer.Browser;
  let bets = [];
  try {
    browser = await puppeteer.launch({
      headless: false,
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

export default async function retriveBetsAndUpdateDb() {
  console.time('scrap time'); 
  const bets = await retriveBets();
  console.log("Alalas! ", bets.length, bets.flat())
  console.timeEnd('scrap time'); 
}