import puppeteer from 'puppeteer';
import { save as saveBettables, Bettable } from '../../models/bettable';
import HomePage from './pages/homePage';

async function retriveBets() {
  
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

    const bets = await homepage.getFootballBets();
    
  } catch(e) {
    console.error(e);
  } finally {
    browser.close();
  }

}

export default async function retriveBetsAndUpdateDb() {
  console.time('scrap time'); 
  const bets = await retriveBets();
  console.timeEnd('scrap time'); 
}