import * as R from "ramda";

type ReadonlyDate = Readonly<Date>;

interface CreateHeartParams {
  /**
   * Maximum allowed mean interval between heart beats to still consider
   * healthy (milliseconds).
   */
  readonly maxMeanInterval: number;

  /**
   * Number of most recent heart beats to keep stored.
   *
   * Those are going to be considered on the mean interval
   * calculation to assert if the heart is healthy.
   */
  readonly size?: number;
}

export function createHeart(params: CreateHeartParams) {
  const { maxMeanInterval, size = 10 } = params;

  // Initialize with the current date so the health check passes after the
  // heart is created for at least the period defined in maxInterval.
  const lastBeats: ReadonlyDate[] = [new Date()];

  const beat = () => {
    lastBeats.push(new Date());
    if (lastBeats.length > size) {
      lastBeats.shift();
    }
  };

  const isHealthy = () => {
    const mean = meanInterval([...lastBeats, new Date()]);
    if (mean > maxMeanInterval) return false;
    return true;
  };

  return { beat, isHealthy } as const;
}

export type Heart = ReturnType<typeof createHeart>;

function meanInterval(dates: readonly ReadonlyDate[]): number {
  const pairs = R.aperture(2, dates);
  const diffs = pairs.map(([a, b]) => b.getTime() - a.getTime());
  return R.mean(diffs);
}
