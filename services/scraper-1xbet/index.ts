import OneXBetRetriveBetsAndUpdateDb from "./houses/1xbet";

import DB from "@bet/db";

const SCRAPPING_INTERVAL = 10 * 1000; // 10 seconds

class Manager {
  private scrappers = {};

  async start(name: string, fn: () => Promise<number>): Promise<void> {
    this.scrappers[name] = fn;
    await this.run(name);
  }

  private async run(name) {
    const scrapper = this.scrappers[name];

    console.log(`Starting ${name} sync.`);
    console.time(name);
    const count = await scrapper();
    console.log(`${name} ended with ${count} bets found. Time spent:`);
    console.timeEnd(name);

    setTimeout(() => {
      this.run(name);
    }, SCRAPPING_INTERVAL);
  }
}

async function main() {
  await DB.getInstance().connect();
  const manager = new Manager();

  manager.start("1XBET", OneXBetRetriveBetsAndUpdateDb);
}

main().then().catch(console.error);
