'use strict';

import repl from 'repl';
import DB from './src/config/db';

const replServer = repl.start({
	prompt: "cli > ",
	terminal: true
})
replServer.write('\n');

DB.getInstance().connect().then(db => {
	replServer.context.db = db;
});