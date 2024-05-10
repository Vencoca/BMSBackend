import { MongoMemoryServer } from "mongodb-memory-server";
import { Mongoose } from "mongoose";

import {
  addNullValues,
  createMeasurement,
  fetchAllMeasurements,
  fetchMeasurement
} from "../measurements";
import measurementsMocks from "../mocks/measurements.json";
import seedDB from "./seedDB";

describe("Measurement service tests", function () {
  let mongoose: Mongoose;
  let mongodb: MongoMemoryServer;
  let testData: Map<string, any>;

  beforeAll(async () => {
    [mongodb, mongoose, testData] = await seedDB();
  });

  afterAll(async () => {
    mongodb.stop();
    await mongoose?.connection.close();
  });

  describe("fetchAllMeasurements", () => {
    test("fetchAllMeasurements (seeding)", async () => {
      let pragueTemperature = await fetchAllMeasurements("pragueTemperature");
      expect(pragueTemperature).toHaveLength(
        measurementsMocks["pragueTemperature"].length
      );
      expect(testData.get("pragueTemperature")).toHaveLength(
        measurementsMocks["pragueTemperature"].length
      );
    });
  });

  describe("fetchMeasurement", function () {
    test("Fetch all temperatures (agregation method should be equal)", async function () {
      const temperaturesAvg = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$avg"
      );
      expect(temperaturesAvg).toHaveLength(24);

      for (let i = 0; i < temperaturesAvg.length; i++) {
        expect(temperaturesAvg[i].timestamp).toEqual(
          testData.get("pragueTemperature")[i].timestamp
        );
        expect(temperaturesAvg[i].value).toEqual(
          testData.get("pragueTemperature")[i].value
        );
      }
      const temperaturesMax = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$max"
      );
      expect(temperaturesMax).toEqual(temperaturesAvg);
      const temperaturesMin = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$min"
      );
      expect(temperaturesMin).toEqual(temperaturesAvg);
      const temperaturesSum = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$sum"
      );
      expect(temperaturesSum).toEqual(temperaturesAvg);
    });

    test("Averaging values", async function () {
      const temperaturesAvg = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        12,
        "$avg"
      );
      expect(temperaturesAvg).toHaveLength(12);
      const temperaturesAvgAll = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        1,
        "$avg"
      );
      expect(temperaturesAvgAll).toHaveLength(1);
      expect(temperaturesAvgAll[0].value).toBeCloseTo(21.65);
      expect(temperaturesAvgAll[0].timestamp).toEqual(
        new Date("2024-01-01T00:00:00Z")
      );
    });

    test("Empty interval", async function () {
      const temperaturesAvg = await fetchMeasurement(
        "pragueTemperature",
        new Date("2024-01-02T00:00:00Z"),
        new Date("2024-01-03T00:00:00Z"),
        24,
        "$avg"
      );
      expect(temperaturesAvg).toHaveLength(24);
      temperaturesAvg.forEach((temperature) => {
        expect(temperature.value).toBeNull();
      });
    });
  });

  describe("addNullValues", () => {
    test("addNullValues to emptyy array", async () => {
      const data = [
        { _id: 0, value: 10 },
        { _id: 2, value: 20 }
      ];
      const startInterval = new Date();
      const intervalSize = 100;
      const numberOfItems = 5;
      const result = addNullValues(
        data,
        startInterval,
        intervalSize,
        numberOfItems
      );

      expect(result).toHaveLength(numberOfItems);
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(null);
      expect(result[2].value).toBe(20);
    });
  });

  describe("createMeasurement", () => {
    test("Error while creating", async () => {
      // @ts-ignore
      await expect(createMeasurement({}, {}, {})).rejects.toThrow(
        "Error creating measurement: MeasurementModel is not a constructor"
      );
    });
  });
});
