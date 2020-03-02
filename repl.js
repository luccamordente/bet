'use strict';

const repl = require('repl');
const getDbInstance = require('./config/db').getDbInstance;
const puppeteer = require('puppeteer');


puppeteer.launch({headless: false}).then((browser) => {
	browser.newPage().then((page) => {
		getDbInstance().then((db) => {
			const replServer = repl.start({
				prompt: "cli >",
				terminal: true
			})

			replServer.write('\n')
			replServer.context.db = db;
			replServer.context.page = page;

		})
	})
})
