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
): Promise<IMeasurement[]> {
  const timeIntervalInMilliseconds =
    (to.getTime() - from.getTime()) / numberOfItems;
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

  const aggregationPipeline: any[] = [
    matchStage,
    {
      $group: {
        _id: {
          $toDate: {
            $subtract: [
              { $toLong: "$timestamp" },
              { $mod: [{ $toLong: "$timestamp" }, timeIntervalInMilliseconds] }
            ]
          }
        },
        value: { [aggregationOperation]: "$value" }
      }
    },
    {
      $project: {
        _id: 0,
        timestamp: "$_id",
        value: 1
      }
    },
    {
      $sort: { timestamp: 1 }
    }
  ];

  return await Measurements[measurementName].aggregate(aggregationPipeline);
}
