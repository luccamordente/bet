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

async function getEventsWithUrl(page) {
	const footballCategorySelector = 'ul.sport_menu li:first-child';
	const footballCategory = await page.$(footballCategorySelector);
	const footballCategoryLink = await footballCategory.$('a')
	await setEventFilterTo(page);
	await delay(3000)
	await footballCategoryLink.click();
	
	await page.waitForSelector(footballCategorySelector + " ul");
	
	const eventsWithUrl = [];

	const championships = await footballCategory.$$('ul > li');

	for( const championship of championships) {
		const championshipLink = await championship.$('a');
		
		await championshipLink.click();
		await page.waitForSelector(footballCategorySelector + " ul > li ul ");

		const events = await championship.$$('ul > li a');

		for( const event of events) {

			eventsWithUrl.push(await event.evaluate((node) => {
				const link = node.getAttribute('href')
				node.parentNode.removeChild(node);
				return link;
			}))
		}

		await championship.evaluate((node) => {
			node.parentNode.removeChild(node);
		})

	}

	return eventsWithUrl;

}

async function main() {
	const browser = await puppeteer.launch({headless: false});
	const page = await browser.newPage();
	await page.goto("https://br.1xbet.com/")
	await page.setViewport({ width: 1366, height: 900});
	await getEventsWithUrl(page)


	// const conn = await mongoClient.connect("mongodb+srv://betterbet:tXGvRktFZpXWZUq3@betterbet-cfnll.mongodb.net/test?retryWrites=true&w=majority")
	// const db = conn.db('better_bet')
	// const db = await getDbInstance();
	// await db.collection('event_odds').insertOne({
	// 	odd: 1.2
	// });


  // await browser.close();

  
}

main();
