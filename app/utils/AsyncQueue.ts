import pQueue from 'p-queue';

type OnFinishCallback = (errorCount: number, successCount: number) => void;

export default class AsyncQueue<T> {
  errorCount: number;
  successCount: number;
  processingQueue: pQueue;
  workerFunction: (data?: any) => Promise<any>;

  constructor(workerFunction: (data?: any) => Promise<any>, concurrencyLimit: number) {
    this.errorCount = 0;
    this.successCount = 0;
    this.workerFunction = workerFunction;
    this.processingQueue = new pQueue({concurrency: concurrencyLimit});
  }

  async addJobsAndWaitForComplete(
    paramsArray: T[],
    onFinishCallback?: OnFinishCallback,
  ) {
    return new Promise<void>(async(resolve) => {
      if (paramsArray.length === 0) {
        return resolve();
      }

      paramsArray.forEach(async(row) => {
        await this.processingQueue.add(() => {
          return this.workerFunction(row).then(() => {
            this.successCount += 1;
          }).catch((e) => {
            this.errorCount += 1;
            console.error("One of the functions returned an error!", row, e);
          })
          
        });
      });

      await this.processingQueue.onIdle();

      if (onFinishCallback != null) {
        onFinishCallback(this.errorCount, this.successCount);
        resolve();
      }
    });
  }
}


