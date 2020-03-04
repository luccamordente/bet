import { queue, AsyncQueue as AsyncQueueOriginal, AsyncWorker } from 'async';

type OnFinishCallback = (errorCount: number, successCount: number) => void;

export default class AsyncQueue<T> {
  errorCount: number;
  successCount: number;
  processingQueue: AsyncQueueOriginal<T>;

  constructor(workerFunction: AsyncWorker<T>, concurrencyLimit: number) {
    this.errorCount = 0;
    this.successCount = 0;
    this.processingQueue = queue(workerFunction, concurrencyLimit);
  }

  async addJobsAndWaitForComplete(
    paramsArray: T[],
    onFinishCallback: OnFinishCallback,
  ) {
    return new Promise<void>(resolve => {
      if (paramsArray.length === 0) {
        resolve();
        return;
      }

      paramsArray.forEach(row => {
        console.log("Pushing row:", row)
        this.processingQueue.push(row, error => {
          if (error != null) {
            console.error(error);
            this.errorCount += 1;
          } else {
            this.successCount += 1;
          }
        });
      });

      this.processingQueue.drain( () => {
        console.log("drain")
        if (onFinishCallback != null) {
          onFinishCallback(this.errorCount, this.successCount);
        }
        resolve();
      })
    });
  }
}