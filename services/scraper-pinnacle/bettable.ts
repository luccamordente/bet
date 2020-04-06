import DB from './db';
import { Bettable } from '@bet/types';

async function save(bettable: Bettable): Promise<void> {
  const {db} = DB.getInstance();
  return db.collection('bettables').replaceOne({
      market: bettable.market,
      house: bettable.house,
      sport: bettable.sport,
      event: bettable.event,
    }, bettable, {upsert: true});
}

export {
  save,
  Bettable
};






