'use strict';

import repl from 'repl';
import DB from './app/config/db';
import puppeteer from 'puppeteer';

const replServer = repl.start({
	prompt: "cli > ",
	terminal: true
})
replServer.write('\n');

DB.getInstance().then(db => {
	replServer.context.db = db;
});

replServer.context.launch = (fn) => {
	puppeteer.launch({headless: false}).then((browser) => {
		browser.newPage().then((page) => {
			fn(page);
		});
	});
};
