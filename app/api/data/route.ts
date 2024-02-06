import singletonTuyaAPIHandler from "@/utils/TuyaCloudApiHandler";
import clientPromise from "@/utils/mongodb";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error('API_KEY environment variable is missing.');
}

export async function GET(req: NextRequest) {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) {
        return NextResponse.json({
            status: 401,
            message: 'Unauthorized: Missing Authorization header',
        });
    }

    const incomingApiKey = authorizationHeader.replace('Bearer ', '');
    if (incomingApiKey !== apiKey) {
        return NextResponse.json({
            status: 401,
            message: 'Unauthorized: Invalid API key',
        });
    }

    const client = await clientPromise;
    const db = client.db("homeStats");
    const collection = db.collection("smartStrip");

    var currentDate = new Date();
    var oneWeekAgoTimestamp = currentDate.getTime() - (1 * 24 * 60 * 60 * 1000);
    var oneWeekAgoDate = new Date(oneWeekAgoTimestamp);

    const filter = { "ts": { "$gte": oneWeekAgoDate } };
    const result = await collection.find(filter).toArray();

    return NextResponse.json({
        status: 200,
        now: currentDate.getTime(),
        data: result,
    });
}