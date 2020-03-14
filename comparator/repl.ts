'use strict';

import repl from 'repl';
import DB from './src/config/db';

import { getCollection } from './src/models/bettable';
import group from './src/utils/group';

const replServer = repl.start({
  prompt: "cli > ",
  terminal: true
})
replServer.write('\n');

DB.getInstance().connect().then(db => {
  replServer.context.db = db;
  replServer.context.collections = {
    bettables: getCollection(),
  };
});

replServer.context.group = group;
