import Measurements, {
  IMeasurement,
  MeasurementType
} from "@/models/measurements";

export async function createMeasurement(
  measurementName: MeasurementType,
  value: Number,
  timestamp: Date
) {
  try {
    const MeasurementModel = Measurements[measurementName];
    const measurement = new MeasurementModel({ value, timestamp });
    return await measurement.save();
  } catch (error) {
    throw new Error(`Error creating measurement: ${(error as Error).message}`);
  }
}

export async function fetchAllMeasurements(
  measurementName: MeasurementType
): Promise<IMeasurement[]> {
  return await Measurements[measurementName].find({}).sort({ timestamp: 1 });
}

export async function fetchMeasurement(
  measurementName: MeasurementType,
  from: Date,
  to: Date,
  numberOfItems: number,
  aggregationOperation: "$sum" | "$avg" | "$min" | "$max"
): Promise<Partial<IMeasurement>[]> {
  //Match stage
  const matchStage: any = { $match: {} };
  from &&
    (matchStage.$match.timestamp = {
      ...matchStage.$match.timestamp,
      $gte: from
    });
  to &&
    (matchStage.$match.timestamp = {
      ...matchStage.$match.timestamp,
      $lte: to
    });

  //Group stage
  const timeIntervalInMilliseconds =
    (to.getTime() - from.getTime()) / numberOfItems;
  const intervalSize = {
    $divide: [{ $subtract: ["$timestamp", from] }, timeIntervalInMilliseconds]
  };
  const intervalStart = {
    $add: [
      from,
      { $multiply: [timeIntervalInMilliseconds, { $trunc: intervalSize }] }
    ]
  };
  const groupStage: any = {
    $group: {
      _id: { $trunc: intervalSize },
      timestamp: { $first: intervalStart }, // Project the start of the interval
      value: {}
    }
  };
  groupStage.$group.value[aggregationOperation] = "$value";

  const aggregationPipeline: any[] = [
    matchStage,
    groupStage,
    {
      $sort: { timestamp: 1 }
    }
  ];
  const data =
    await Measurements[measurementName].aggregate(aggregationPipeline);
  return addNullValues(data, from, timeIntervalInMilliseconds, numberOfItems);
}

function addNullValues(
  data: any[],
  startInterval: Date,
  intervalSize: number,
  numberOfItems: number
): any[] {
  if (data.length === numberOfItems) {
    return data;
  }

  const nullValues: any[] = [];

  let currentInterval = new Date(startInterval);
  for (let i = 0; i < numberOfItems; i++) {
    nullValues.push({
      _id: i,
      timestamp: new Date(currentInterval),
      value: null
    });
    currentInterval.setTime(currentInterval.getTime() + intervalSize);
  }

  data.forEach((element) => {
    nullValues[element._id].value = element.value;
  });

  return nullValues;
}
