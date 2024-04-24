import { MongoMemoryServer } from "mongodb-memory-server";
import { Mongoose } from "mongoose";
import { testApiHandler } from "next-test-api-route-handler"; // ◄ Must be first import

import * as measurementHelper from "@/lib/services/measurements";
import seedDB from "@/lib/services/tests/seedDB";
import { IMeasurement } from "@/models/measurements";

import * as appHandler from "./route";

jest.mock("../../../lib/services/measurements", () => {
  return {
    __esModule: true,
    ...jest.requireActual("../../../lib/services/measurements")
  };
});

let mongoose: Mongoose;
let mongodb: MongoMemoryServer;
// eslint-disable-next-line unused-imports/no-unused-vars
let testData: Map<string, any>;

beforeAll(async () => {
  [mongodb, mongoose, testData] = await seedDB();
  process.env.API_KEY = "secret";
});

afterAll(async () => {
  mongodb.stop();
  await mongoose?.connection.close();
});

describe("POST", function () {
  test("No Authorization header", async () => {
    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({ method: "POST" });
        await expect(res.json()).resolves.toStrictEqual({
          message: "Unauthorized: Missing Authorization header"
        });
      }
    });
  });

  test("Wrong sercret", async () => {
    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({
          method: "POST",
          headers: { authorization: "Bearer wrongSecret" }
        });
        await expect(res.json()).resolves.toStrictEqual({
          message: "Unauthorized: Invalid API key"
        });
      }
    });
  });

  test("Invalid request body format", async () => {
    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({
          method: "POST",
          headers: { authorization: "Bearer secret" },
          body: JSON.stringify({})
        });
        const { message } = await res.json();
        expect({ message }).toStrictEqual({
          message: "Bad Request: Invalid request body format"
        });
      }
    });
  });

  test("Correct request", async () => {
    const spy = jest.spyOn(measurementHelper, "fetchMeasurement");
    const mockedReturnValue = Promise.resolve([
      {
        value: 10,
        timestamp: new Date("2024-03-17T12:29:24.826Z"),
        metadata: { source: "mock" }
      } as Partial<IMeasurement>,
      {
        value: 20,
        timestamp: new Date("2024-03-16T12:29:24.826Z"),
        metadata: { source: "mock" }
      } as Partial<IMeasurement>
    ]);
    spy.mockReturnValue(mockedReturnValue);

    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({
          method: "POST",
          headers: { authorization: "Bearer secret" },
          body: JSON.stringify({
            measurementName: "smartStripCurrent",
            from: "2024-03-17T12:29:24.826Z",
            to: "2024-03-16T12:29:24.826Z",
            numberOfItems: 24,
            aggregationOperation: "$avg"
          })
        });

        const { result } = await res.json();
        const expected = await mockedReturnValue.then((data) =>
          data.map(({ timestamp, ...rest }) => ({
            ...rest,
            timestamp: timestamp?.toISOString()
          }))
        );

        expect(result).toStrictEqual(expected);
      }
    });
    spy.mockRestore();
  });
});

describe("GET", function () {
  test("No Authorization header", async () => {
    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({ method: "GET" });
        await expect(res.json()).resolves.toStrictEqual({
          message: "Unauthorized: Missing Authorization header"
        });
      }
    });
  });

  test("Wrong sercret", async () => {
    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
          headers: { authorization: "Bearer wrongSecret" }
        });
        await expect(res.json()).resolves.toStrictEqual({
          message: "Unauthorized: Invalid API key"
        });
      }
    });
  });

  test("Correct request", async () => {
    await testApiHandler({
      appHandler,
      async test({ fetch }) {
        const res = await fetch({
          method: "GET",
          headers: { authorization: "Bearer secret" }
        });
        await expect(res.json()).resolves.toStrictEqual({
          message: "Service available",
          aggregationMethods: ["$sum", "$avg", "$min", "$max"],
          lastChange: "2024-04-24T13:08:00Z",
          measurements: [
            "pragueTemperature",
            "smartStripCurrent",
            "smartStripVoltage"
          ]
        });
      }
    });
  });
});
