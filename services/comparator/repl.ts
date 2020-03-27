'use strict';

import repl from 'repl';
import DB from './config/db';

import group from './utils/group';
import publishOpportunity, { opportunityMessage } from './publishOpportunity';

import { SendMessageParams } from '../../packages/telegram-bot-api';
import { Opportunity } from './models/opportunity';

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
  
  replServer.context.publishOpportunity = function(opportunity: Opportunity, params: SendMessageParams) {
    publishOpportunity(opportunity, { disable_notification: true, ...params});
  };
  replServer.context.opportunityMessage = opportunityMessage;
});

replServer.context.group = group;
