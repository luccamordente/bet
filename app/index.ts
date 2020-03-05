'use strict';

const puppeteer = require('puppeteer');
import OneXBetRetriveBetsAndUpdateDb from  './houses/1xbet'
import PinnacleRetriveBetsAndUpdateDb from  './houses/pinnacle'

async function main() {

	// await OneXBetRetriveBetsAndUpdateDb();
	await PinnacleRetriveBetsAndUpdateDb();
}

main().then(() => {console.log("Over bitch.")}).catch(console.error);