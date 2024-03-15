import { NextRequest, NextResponse } from "next/server";

import { fetchMeasurement } from "@/lib/services/measurements";
import { measurementsNames } from "@/models/measurements";

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable is missing.");
}

export async function POST(req: NextRequest) {
  const authorizationHeader = req.headers.get("Authorization");
  if (!authorizationHeader) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized: Missing Authorization header"
    });
  }

  const incomingApiKey = authorizationHeader.replace("Bearer ", "");
  if (incomingApiKey !== apiKey) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized: Invalid API key"
    });
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
    return NextResponse.json({
      status: 400,
      message: "Bad Request: Invalid request body format"
    });
  }

  try {
    const result = await fetchMeasurement(
      measurementName,
      from,
      to,
      numberOfItems,
      aggregationOperation
    );
    return NextResponse.json({
      status: 200,
      result
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: "Internal Server Error"
    });
  }
}
