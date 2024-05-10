import { NextRequest, NextResponse } from "next/server";

import connectToMongoDB from "@/lib/database";
import Logger from "@/lib/logger";
import getTemperatureInPrague from "@/lib/OpenWeather";
import { createMeasurement } from "@/lib/services/measurements";
import singletonTuyaAPIHandler from "@/lib/TuyaCloudApiHandler";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({
      status: 401,
      message: "Unauthorized"
    });
  }
  try {
    await connectToMongoDB();
    const data = await singletonTuyaAPIHandler.getData();
    const curCurrent = data.find(
      (item: any) => item.code === "cur_current"
    ).value;
    const curVoltage = data.find(
      (item: any) => item.code === "cur_voltage"
    ).value;
    const temperature = await getTemperatureInPrague();
    const timestamp = new Date();
    const measurementsPromises = [
      createMeasurement("smartStripCurrent", curCurrent, timestamp),
      createMeasurement("smartStripVoltage", curVoltage / 10, timestamp),
      createMeasurement("pragueTemperature", temperature, timestamp)
    ];
    await Promise.all(measurementsPromises);
    return NextResponse.json({
      status: 200
    });
  } catch (e) {
    Logger.debug(e);
    return NextResponse.json({
      status: 500,
      error: "Internal Server Error"
    });
  }
}
