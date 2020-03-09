'use strict';

import OneXBetRetriveBetsAndUpdateDb from  './houses/1xbet';
import PinnacleRetriveBetsAndUpdateDb from  './houses/pinnacle';

async function main() {

	await OneXBetRetriveBetsAndUpdateDb();
	// await PinnacleRetriveBetsAndUpdateDb();
}

main();