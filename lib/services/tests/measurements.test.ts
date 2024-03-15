import { MongoMemoryServer } from "mongodb-memory-server";
import { Mongoose } from "mongoose";

import { fetchAllMeasurements, fetchMeasurement } from "../measurements";
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
      let temperatureInPrague = await fetchAllMeasurements(
        "temperatureInPrague"
      );
      expect(temperatureInPrague).toHaveLength(
        measurementsMocks["temperatureInPrague"].length
      );
      expect(testData.get("temperatureInPrague")).toHaveLength(
        measurementsMocks["temperatureInPrague"].length
      );
    });
  });

  describe("fetchMeasurement", function () {
    test("Fetch all temperatures (agregation method should be equal)", async function () {
      const temperaturesAvg = await fetchMeasurement(
        "temperatureInPrague",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$avg"
      );
      expect(temperaturesAvg).toHaveLength(24);

      for (let i = 0; i < temperaturesAvg.length; i++) {
        expect(temperaturesAvg[i].timestamp).toEqual(
          testData.get("temperatureInPrague")[i].timestamp
        );
        expect(temperaturesAvg[i].value).toEqual(
          testData.get("temperatureInPrague")[i].value
        );
      }
      const temperaturesMax = await fetchMeasurement(
        "temperatureInPrague",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$max"
      );
      expect(temperaturesMax).toEqual(temperaturesAvg);
      const temperaturesMin = await fetchMeasurement(
        "temperatureInPrague",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$min"
      );
      expect(temperaturesMin).toEqual(temperaturesAvg);
      const temperaturesSum = await fetchMeasurement(
        "temperatureInPrague",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        24,
        "$sum"
      );
      expect(temperaturesSum).toEqual(temperaturesAvg);
    });

    test("Averaging values", async function () {
      const temperaturesAvg = await fetchMeasurement(
        "temperatureInPrague",
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-02T00:00:00Z"),
        12,
        "$avg"
      );
      expect(temperaturesAvg).toHaveLength(12);
      const temperaturesAvgAll = await fetchMeasurement(
        "temperatureInPrague",
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
        "temperatureInPrague",
        new Date("2024-01-02T00:00:00Z"),
        new Date("2024-01-03T00:00:00Z"),
        24,
        "$avg"
      );
      expect(temperaturesAvg).toHaveLength(0);
    });
  });
});
