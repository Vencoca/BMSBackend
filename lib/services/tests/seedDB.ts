import { MongoMemoryServer } from "mongodb-memory-server";
import { Mongoose } from "mongoose";

import connectToMongoDB from "@/lib/database";

import { createMeasurement, fetchAllMeasurements } from "../measurements";
import measurementsMocks from "../mocks/measurements.json";

export default async function seedDB(): Promise<
  [MongoMemoryServer, Mongoose, Map<string, any>]
> {
  const [mongodb, mongoose] = await prepare();

  await Promise.all([seedMeasurements()]);

  const [temperatureInPrague, smartStripVoltage] = await Promise.all([
    fetchAllMeasurements("pragueTemperature"),
    fetchAllMeasurements("smartStripVoltage")
  ]);

  const testData = new Map<string, any>();
  testData.set("pragueTemperature", temperatureInPrague);
  testData.set("smartStripVoltage", smartStripVoltage);
  return [mongodb, mongoose, testData];
}

async function prepare(): Promise<[MongoMemoryServer, Mongoose]> {
  const mongodb = new MongoMemoryServer();
  await mongodb.start();
  process.env.MONGODB_URI = mongodb.getUri();
  process.env.ENCRYPTION_KEY = "topSecret";
  mongoose = await connectToMongoDB();
  return [mongodb, mongoose];
}

async function seedMeasurements() {
  const measurementsPromises = [];
  for (const measurementType in measurementsMocks) {
    const measurements =
      measurementsMocks[measurementType as keyof typeof measurementsMocks];
    for (const measurement of measurements) {
      const { value, timestamp } = measurement;
      measurementsPromises.push(
        createMeasurement(measurementType, value, new Date(timestamp))
      );
    }
  }
  await Promise.all(measurementsPromises);
}
