import prand from "pure-rand";

import { IMeasurement, MeasurementType } from "@/models/measurements";

export default function generateData(
  measurementName: MeasurementType,
  from: Date,
  to: Date,
  numberOfItems: number,
  aggregationOperation: "$sum" | "$avg" | "$min" | "$max"
): Promise<Partial<IMeasurement>[]> {
  const seed = from.getTime() + to.getTime();
  const rng = prand.xoroshiro128plus(seed);
  const timeIntervalInMilliseconds =
    (to.getTime() - from.getTime()) / numberOfItems;
  const data = [];

  const randInterval = { from: 0, to: 0 };
  if (measurementName === "temperatureInPrague") {
    randInterval.from = 15;
    randInterval.to = 24;
  } else if (measurementName === "smartStripCurrent") {
    randInterval.from = 60;
    randInterval.to = 120;
  } else {
    randInterval.from = 220;
    randInterval.to = 230;
  }

  for (let i = 0; i < numberOfItems; i++) {
    let zero;
    if (measurementName !== "temperatureInPrague") {
      zero = prand.unsafeUniformIntDistribution(0, 1, rng);
    } else {
      zero = 0;
    }

    data.push({
      value: zero
        ? 0
        : prand.unsafeUniformIntDistribution(
            randInterval.from,
            randInterval.to,
            rng
          ),
      timestamp: new Date(to.getTime() + timeIntervalInMilliseconds * i)
    });
  }
  return Promise.resolve(data);
}
