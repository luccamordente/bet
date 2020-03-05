'use strict';

const repl = require('repl');
const fetch = require('node-fetch');
const getDbInstance = require('./app/config/db').getDbInstance;
const puppeteer = require('puppeteer');


puppeteer.launch({headless: false}).then((browser) => {
	browser.newPage().then((page) => {
		// getDbInstance().then((db) => {
			const replServer = repl.start({
				prompt: "cli >",
				terminal: true
			})

			replServer.write('\n')
			replServer.context.db = db;
			replServer.context.fetch = fetch;
			replServer.context.page = page;

		// })
	})
})
