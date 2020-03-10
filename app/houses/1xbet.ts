'use strict';

const puppeteer = require('puppeteer');
// import AsyncQueue from  './utils/AsyncQueue'

const getDbInstance = require('../config/db').getDbInstance;

const CONCURRENT_CHROMIUM_TABS = 4;

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function setEventFilterTo(page) {
  const filterDiv = await page.$('div.ls-filter__name');
  await filterDiv.click();

  delay(2000);

  const hourlyFilterLink = await page.$('div.ls-filter__wrap a.chosen-single');
  await hourlyFilterLink.click();
  delay(100)

  const hourlyFilterOptions = await page.$$('div.ls-filter__wrap li.active-result');
  await hourlyFilterOptions[3].click();

  delay(100)
  const applyFilterButton = await page.$('div.ls-filter__wrap button.ls-filter__btn');
  await applyFilterButton.click();  
}

function getInnerText(node) { return node.innerText }

const MARKETS_WHITELIST = [
  'Total'
];

async function getEventsUrls(page) {
  const footballCategorySelector = 'ul.sport_menu li:first-child';
  const footballCategory = await page.$(footballCategorySelector);
  const footballCategoryLink = await footballCategory.$('a')
  await setEventFilterTo(page);
  await delay(3000)
  
  await footballCategoryLink.click();

  await page.waitForSelector(footballCategorySelector + " ul");
  
  const eventsUrls = [];

  const championships = await footballCategory.$$('ul > li');
  
  for( const championship of championships) {

    const championshipLink = await championship.$('a');
    await championshipLink.click();
    await page.waitForSelector(footballCategorySelector + " ul > li ul ");

    const events = await championship.$$('ul.event_menu > li > a');
    
    for( const event of events) {
      console.time('clicktest');
      await event.click();
      await delay(300);
      const bets = await getEventBets(page);
      for (const bet of bets) {
        Object.assign(bet, { sport: 'Football', house: '1xBet' });
        
        // TODO send somewhere to be processed. maybe add to a queue?
        console.log(bet);
      }
      console.timeEnd('clicktest');
      eventsUrls.push(await event.evaluate((node) => {
        const link = node.getAttribute('href');
        node.parentNode.removeChild(node);
        return link;
      }));
    }

    await championship.evaluate((node) => {
      node.parentNode.removeChild(node);
    });

    

  }

  return eventsUrls;
}

async function getTeamsData(page) {
  const teamsElements = await page.$$('.c-scoreboard-team__name');
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
  const betGroupsElements = await page.$$('.bet_group');
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

async function getStartTime(page) {
  // TODO stat time is not available in non match pages
  return await (await page.$('.c-scoreboard__start--green')).evaluate(getInnerText);
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

  const browser = await puppeteer.launch({
    headless: false,
      defaultViewport: { width: 1900, height: 1900},
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = (await browser.pages())[0];
  await page.goto("https://br.1xbet.com/");
  
  const eventsUrls = await getEventsUrls(page);
  page.close();
  // const eventsUrls = ["line/Football/176125-Russian-Cup/68481529-Khimki-Torpedo-Moscow/","line/Football/67559-Club-Friendlies/72379565-Persis-Solo-Semen-Padang/","line/Football/67559-Club-Friendlies/72344664-Rosenborg-Bodo-Glimt/","line/Football/67559-Club-Friendlies/72344663-Brodd-Vidar/","line/Football/67559-Club-Friendlies/72372656-Degerfors-Karlstad-II/","line/Football/28645-Algeria-Ligue-1/72328384-Biskra-ES-Setif/","line/Football/28645-Algeria-Ligue-1/72328393-CA-Bordj-Bou-Arreridj-MC-Alger/","line/Football/28645-Algeria-Ligue-1/72328386-JS-Kabylie-USM-Bel-Abbes/","line/Football/21505-Algeria-Ligue-2/72328387-USM-El-Harrach-Amal-Bou-Saada/","line/Football/67487-Argentina-Reserve-League/72353210-CA-Los-Andes-II-Club-Social-y-Deportivo-Tristan-Suarez-II/","line/Football/51125-Armenia-First-League/72336943-Alashkert-II-Lernayin-Artsakh/","line/Football/51125-Armenia-First-League/72333018-Dilijan-Urartu-II/","line/Football/51125-Armenia-First-League/72336944-West-Armenia-Pyunik-II/","line/Football/1161639-Australia-South-Australia-NPL-Women/72336232-Salisbury-Inter-Women-Adelaide-University-Women/","line/Football/12961-Azerbaijan-Division-1/72329195-Sabah-II-Neftchi-Baku-II/","line/Football/12961-Azerbaijan-Division-1/72329190-Zaqatala-Sabail-II/","line/Football/12961-Azerbaijan-Division-1/72329198-Qarabag-II-Qaradag/","line/Football/2072013-Bangladesh-Championship-Women/72382961-Bashundhara-Kings-Women-Nasrin-Sports-Academy-Women/","line/Football/2072013-Bangladesh-Championship-Women/72380903-Jamalpur-Kacharipara-Akadas-Women-Uttar-Bango-Women/","line/Football/1226377-Bhutan-Super-League/72340774-Druk-Stars-Gomo/","line/Football/114739-Bulgarian-Cup/72024907-Levski-Sofia-Ludogorets-1945/","line/Football/34481-Cameroon-Elite-One/72334833-Bamboutos-de-Mbouda-Eding-Sport/","line/Football/34481-Cameroon-Elite-One/72334831-APEJES-Academy-Colombe-du-Dja-et-Lobo/","line/Football/34481-Cameroon-Elite-One/72334832-Fovu-Club-Baham-Coton-Sport-de-Garoua/","line/Football/34481-Cameroon-Elite-One/72334834-Stade-Renard-Melong-Union-Douala/","line/Football/1761550-Democratic-Republic-of-the-Congo-SuperLeague/72336123-Renaissance-du-Congo-Saint-Eloi-Lupopo/","line/Football/304961-International-Tournament-Cyprus-Cup-Women/72378126-Croatia-Women-Mexico-Women/","line/Football/304961-International-Tournament-Cyprus-Cup-Women/72378125-Czech-Republic-Women-Finland-Women/"]
  
  // console.time('test');

  // const queue = new AsyncQueue(async(url)=> {
  //   console.log("Executando item: ", url);
  //   let eventPage;
  //   try {
  //     eventPage = await browser.newPage();
  //       await eventPage.setRequestInterception(true);
        
  //       eventPage.on('request', (req) => {
  //           if( req.resourceType() == 'image'){
  //               req.abort();
  //           }
  //           else {
  //               req.continue();
  //           }
  //       });

  //     await eventPage.goto("https://br.1xbet.com/en/" + url);
      
  //     const bets = await getEventBets(eventPage);
  //     for (const bet of bets) {
  //       Object.assign(bet, { sport: 'Football', house: '1xBet' });
        
  //       // TODO send somewhere to be processed. maybe add to a queue?
  //       // console.log(bet);
  //     }
  //   } catch(e) {
  //     throw e;
  //   } finally {
  //     eventPage.close();
  //   }

  //   return;
  // }, CONCURRENT_CHROMIUM_TABS)

  // await queue.addJobsAndWaitForComplete(eventsUrls, (errorCount, successCount) => {
  //   console.log(`Acabou de processar! Total de errors ${errorCount}, total de sucesso: ${successCount}`)
  // });


  // // const conn = await mongoClient.connect("mongodb+srv://betterbet:tXGvRktFZpXWZUq3@betterbet-cfnll.mongodb.net/test?retryWrites=true&w=majority")
  // // const db = conn.db('better_bet')
  // // const db = await getDbInstance();
  // // await db.collection('event_odds').insertOne({
  // //   odd: 1.2
  // // });

  // console.log(`28 urls, com abas ${CONCURRENT_CHROMIUM_TABS} ao mesmo tempo: `)
  // console.timeEnd('test');

  await browser.close();
}

