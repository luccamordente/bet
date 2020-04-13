import puppeteer from "puppeteer";

import withWebsite from "./utils/website";

import routines from "./routines";
import * as spiders from "./spiders";

import { Routine, Action, createChainedRoutine } from "./utils/routine";
import { Egg, Data } from "./types";

interface Task extends Egg {
  action?: Action;
}

async function run(emit: (data: Data) => void) {
  const runTask = async function (task: Task): Promise<Task[]> {
    let eggs: Egg[] = [];

    if (task.action == null) {
      emit(task.data);
      return [];
    }

    const spiderParams = {
      page: task.page,
      data: task.data,
      element: task.element,
      options: task.action.options,
    };

    switch (task.action.kind) {
      case "open-sport-page":
        eggs = await spiders.openSportPage(spiderParams);
        break;
      case "open-all-matches-page":
        eggs = [{ data: task.data, page: task.page }];
        break;
      case "retrieve-all-leagues":
        eggs = [
          {
            data: { ...task.data, leagueName: "Random League" },
            page: task.page,
          },
        ];
        break;
      case "open-league":
        eggs = [{ data: task.data, page: task.page }];
        break;
      case "retrieve-all-matches":
        eggs = [
          { data: { ...task.data, eventStartTime: "10:00" }, page: task.page },
        ];
        break;
      case "open-match":
        eggs = [{ data: task.data, page: task.page }];
        break;
      case "retrieve-all-market-tabs":
        eggs = [{ data: task.data, page: task.page }];
        break;
      case "open-market-tab":
        eggs = [{ data: task.data, page: task.page }];
        break;
      case "retrieve-all-market-groups":
        eggs = [
          {
            data: { ...task.data, marketGroup: "2-Way Handicap" },
            page: task.page,
          },
        ];
        break;
      case "open-market-group":
        eggs = [{ data: { ...task.data }, page: task.page }];
        break;
      case "retrieve-market-matrix":
        eggs = [
          {
            data: {
              ...task.data,
              marketMatrix: [
                [1, 1],
                [1, 1],
              ],
            },
            page: task.page,
          },
        ];
        break;
    }

    return eggs.map((child) => ({
      ...child,
      ...(task.action != null ? { action: task.action.next } : null),
    }));
  };

  const runRoutine = async function (routine: Routine, page: puppeteer.Page) {
    const chain = createChainedRoutine(routine);

    let tasks: Task[] = [
      {
        action: chain.action,
        data: {},
        page,
      },
    ];

    while (tasks.length > 0) {
      const task = tasks.shift();
      if (task != null) {
        tasks = [...(await runTask(task)), ...tasks];
      }
    }
  };

  // while (true) {
  for (const routine of routines) {
    await withWebsite(async (page) => {
      await runRoutine(routine, page);
    });
  }
  // }
}

export default run;
