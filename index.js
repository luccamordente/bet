'use strict';
const puppeteer = require('puppeteer');

const getDbInstance = require('./config/db').getDbInstance;

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

async function main() {
	const browser = await puppeteer.launch({headless: true});
	
	const page = await browser.newPage();
	await page.goto("https://br.1xbet.com/");
	await page.setViewport({ width: 1366, height: 1000});
	
	const eventsUrls = await getEventsUrls(page);

	for (const eventUrl of eventsUrls) {
		await page.goto("https://br.1xbet.com/en/"+eventUrl);
		
		const bets = await getEventBets(page);
		for (const bet of bets) {
			Object.assign(bet, { sport: 'Football', house: '1xBet' });
			
			// TODO send somewhere to be processed. maybe add to a queue?
			console.log(bet);
		}
	}

	// const conn = await mongoClient.connect("mongodb+srv://betterbet:tXGvRktFZpXWZUq3@betterbet-cfnll.mongodb.net/test?retryWrites=true&w=majority")
	// const db = conn.db('better_bet')
	// const db = await getDbInstance();
	// await db.collection('event_odds').insertOne({
	// 	odd: 1.2
	// });


  // await browser.close();
}

main().catch(console.error);
