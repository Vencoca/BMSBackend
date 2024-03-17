import { NextRequest, NextResponse } from "next/server";

import { fetchMeasurement } from "@/lib/services/measurements";
import { measurementsNames } from "@/models/measurements";

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

  if (
    typeof measurementName !== "string" ||
    !measurementsNames.includes(measurementName) ||
    !(from instanceof Date) ||
    !(to instanceof Date) ||
    typeof numberOfItems !== "number" ||
    !["$sum", "$avg", "$min", "$max"].includes(aggregationOperation)
  ) {
    return NextResponse.json(
      {
        message: "Bad Request: Invalid request body format"
      },
      { status: 400 }
    );
  }

  try {
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
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}
