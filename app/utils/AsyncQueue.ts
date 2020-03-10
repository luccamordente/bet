import { queue, AsyncQueue as AsyncQueueOriginal, AsyncWorker } from 'async';

type OnFinishCallback = (errorCount: number, successCount: number) => void;

export default class AsyncQueue<T> {
  errorCount: number;
  processingQueue: AsyncQueueOriginal<T>;

  constructor(workerFunction: (item: any) => {}, concurrencyLimit: number) {
    this.errorCount = 0;
    this.processingQueue = queue(async(item, callback) => {
      try {
        await workerFunction(item);
        callback();
      }
      catch (e) {
        callback(e);  
      }
    }, concurrencyLimit);
  }

  async addJobsAndWaitForComplete(
    paramsArray: T[],
    onFinishCallback: OnFinishCallback,
  ) {
    if (paramsArray.length === 0) {
      return;
    };

    this.processingQueue.push(paramsArray)

    this.processingQueue.error((error, task) => {
      console.error("Error on ",  task, error);
      this.errorCount += 1;
    });

    await this.processingQueue.drain();

    if (onFinishCallback != null) {
      onFinishCallback(this.errorCount, paramsArray.length - this.errorCount);
    }
  }
}