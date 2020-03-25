'use strict';

import repl from 'repl';
import DB from './src/config/db';

import group from './src/utils/group';
import publishOpportunity from './src/publishOpportunity';

const replServer = repl.start({
  prompt: "cli > ",
  terminal: true
})
replServer.write('\n');

DB.getInstance().connect().then(async (db) => {
  replServer.context.db = db;
  replServer.context.collections = {
    bettables: await db.collection('bettables'),
    opportunities: await db.collection('opportunities'),
  };
  replServer.context.publish = publishOpportunity;
});

replServer.context.group = group;
