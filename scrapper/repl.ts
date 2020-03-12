'use strict';

import repl from 'repl';
import DB from './src/config/db';
import puppeteer from 'puppeteer';

const replServer = repl.start({
	prompt: "cli > ",
	terminal: true
})
replServer.write('\n');

DB.getInstance().connect().then(db => {
	replServer.context.db = db;
});

replServer.context.launch = (fn) => {
	puppeteer.launch({headless: false}).then((browser) => {
		browser.newPage().then((page) => {
			fn(page);
		});
	});
};
