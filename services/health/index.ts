import moment from "moment";

import { getCollection } from "./models/bettable";
import DB from "@bet/db";

const SPORTS = {
  basketball: "🏀 Basketball",
  esports: "🎮 E-Sports",
  hockey: "🏒 Hockey",
  soccer: "⚽️ Soccer",
  // 'tabletennis': '🏓 Table Tennis',
  // 'tennis': '🎾 Tennis',
};

const HOUSES = {
  marathon: "Marathon",
  pinnacle: "Pinnacle",
  "1xbet": "1XBET",
};

const HEALTH_TEMPLATE = {
  marathon: ["basketball", "esports", "hockey", "soccer"],
  pinnacle: ["basketball", "esports", "hockey", "soccer"],
  "1xbet": ["soccer"],
};

function sportToString(sport: string): string {
  return SPORTS[sport];
}

function houseToString(house: string): string {
  return HOUSES[house];
}

// function getSports(): string[] {
//   return Object.keys(SPORTS);
// }

// function getHouses(): string[] {
//   return Object.keys(HOUSES);
// }

type RawReport = {
  _id: { house: { name: string } };
  sports: {
    name: string;
    count: number;
  }[];
}[];

type Status = 1 | 0;

type Statusable = {
  name: string;
  status: Status;
};

type House = Statusable & {};
type Sport = Statusable & {
  count: number;
};
type ReportItem = {
  house: House;
  sports: Sport[];
};
type Report = ReportItem[];

function getStatusIcon(status: Status) {
  switch (status) {
    case 0:
      return "🔴";
    case 1:
      return "🟢";
  }
}

function reportToString(report: Report): string {
  let text = "";
  for (const { house, sports } of report) {
    text += `\n${getStatusIcon(house.status)} 🏦 ${houseToString(house.name)}`;
    for (const sport of sports) {
      text += `\n  ${getStatusIcon(sport.status)} ${sportToString(
        sport.name,
      )}: ${sport.count}`;
    }
    text += `\n`;
  }
  return text;
}

function createBaseReport(): Report {
  const report: Report = [];
  for (const thouse of Object.keys(HEALTH_TEMPLATE)) {
    const sports: Sport[] = [];

    const tsports = HEALTH_TEMPLATE[thouse];
    for (const tsport of tsports) {
      const sport: Sport = {
        name: tsport,
        count: 0,
        status: 0,
      };
      sports.push(sport);
    }

    const item: ReportItem = {
      house: {
        name: thouse,
        status: 0,
      },
      sports,
    };
    report.push(item);
  }
  return report;
}

function mergeWithBaseReport(report: Report): Report {
  const base = createBaseReport();

  base.forEach((baseItem) => {
    const reportItem = report.find(
      (item) => item.house.name === baseItem.house.name,
    );
    if (reportItem === undefined) {
      return;
    }

    baseItem.sports.forEach((baseItemSport, j) => {
      const reportItemSport = reportItem.sports.find(
        (sport) => sport.name === baseItemSport.name,
      );
      if (reportItemSport === undefined) {
        return;
      }

      baseItem.sports[j] = reportItemSport;
    });

    baseItem.house.status = baseItem.sports
      .map((s) => s.status)
      .reduce((acc, curr) => {
        return (Math.min(acc + curr, 1) as unknown) as Status;
      }, 0);
  });

  return base;
}

function processReport(rawReport: RawReport): Report {
  const report: Report = [];
  for (const rawItem of rawReport) {
    const sports: Sport[] = [];

    for (const rawSport of rawItem.sports) {
      const sport: Sport = {
        name: rawSport.name,
        count: rawSport.count,
        status: rawSport.count > 0 ? 1 : 0,
      };
      sports.push(sport);
    }

    const item: ReportItem = {
      house: {
        name: rawItem._id.house.name,
        status: 0, // this will be calculated later
      },
      sports,
    };

    report.push(item);
  }
  return mergeWithBaseReport(report);
}

async function getReport(): Promise<RawReport> {
  return await getCollection()
    .aggregate([
      {
        $match: {
          extracted_at: {
            $gt: new Date(
              new Date().getTime() - 1000 * 60 * 1,
            ) /* last 2 minutes */,
          },
        },
      },
      {
        $group: {
          _id: { house: "$house", sport: "$sport" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { house: { name: "$_id.house" } },
          sports: {
            $push: { name: "$_id.sport", count: "$count" },
          },
        },
      },
      {
        $sort: { "_id.house": 1, "_id.sport": 1 },
      },
    ])
    .toArray();
}

async function run() {
  try {
    console.group(`\n🏥 Health Check ${moment().format("DD/MM/YY hh:mm")}`);
    console.log(reportToString(processReport(await getReport())));
  } catch (error) {
    console.log(error);
  } finally {
    console.groupEnd();
    setTimeout(run, 3 * 1000);
  }
}

async function main() {
  await DB.getInstance().connect();
  await run();
}

main().catch((e) => {
  throw e;
});
