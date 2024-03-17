import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
import { NextRequest, NextResponse } from "next/server";

import { fetchMeasurement } from "@/lib/services/measurements";
import { MeasurementType } from "@/models/measurements";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable is missing.");
}

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
  if (incomingApiKey !== apiKey) {
    return NextResponse.json(
      {
        message: "Unauthorized: Invalid API key"
      },
      { status: 401 }
    );
  }
  return NextResponse.json(
    {
      message: "Service available"
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
  if (incomingApiKey !== apiKey) {
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
    console.log("Im about to fetch Measurement");
    const result = await fetchMeasurement(
      measurementName,
      from,
      to,
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
    return NextResponse.json(
      {
        message: `Internal Server Error: ${error.message}`
      },
      { status: 500 }
    );
  }
}
