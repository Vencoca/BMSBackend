import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
import { NextRequest, NextResponse } from "next/server";

import generateData from "@/lib/generateData";
import Logger from "@/lib/logger";
import { measurementsNames, MeasurementType } from "@/models/measurements";

export async function GET(req: NextRequest) {
  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader) {
    return NextResponse.json(
      {
        message: "Unauthorized: Missing Authorization header"
      },
      { status: 401 }
    );
  }

  const incomingApiKey = authorizationHeader.replace("Bearer ", "");
  if (incomingApiKey !== process.env.API_KEY) {
    return NextResponse.json(
      {
        message: "Unauthorized: Invalid API key"
      },
      { status: 401 }
    );
  }
  return NextResponse.json(
    {
      message: "Service available",
      measurements: measurementsNames,
      aggregationMethods: ["$sum", "$avg", "$min", "$max"],
      lastChange: "2024-03-20T16:08:00Z"
    },
    { status: 200 }
  );
}

const ajv = new Ajv();
interface postData {
  measurementName: MeasurementType;
  from: Date;
  to: Date;
  numberOfItems: number;
  aggregationOperation: "$sum" | "$avg" | "$min" | "$max";
}
const schema: JTDSchemaType<postData> = {
  properties: {
    measurementName: { type: "string" },
    from: { type: "timestamp" },
    to: { type: "timestamp" },
    numberOfItems: { type: "int32" },
    aggregationOperation: { enum: ["$sum", "$avg", "$min", "$max"] }
  }
};
const validate = ajv.compile(schema);

export async function POST(req: NextRequest) {
  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader) {
    return NextResponse.json(
      {
        message: "Unauthorized: Missing Authorization header"
      },
      { status: 401 }
    );
  }

  const incomingApiKey = authorizationHeader.replace("Bearer ", "");
  if (incomingApiKey !== process.env.API_KEY) {
    return NextResponse.json(
      {
        message: "Unauthorized: Invalid API key"
      },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { measurementName, from, to, numberOfItems, aggregationOperation } =
    body;
  const valid = validate(body);
  if (!valid) {
    return NextResponse.json(
      {
        message: "Bad Request: Invalid request body format",
        errors: validate.errors
      },
      { status: 400 }
    );
  }

  try {
    const result = await generateData(
      measurementName,
      new Date(from),
      new Date(to),
      numberOfItems,
      aggregationOperation
    );

    return NextResponse.json(
      {
        result
      },
      { status: 200 }
    );
  } catch (error: any) {
    Logger.error(error.message);
    return NextResponse.json(
      {
        message: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}
