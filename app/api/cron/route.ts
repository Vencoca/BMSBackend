import singletonTuyaAPIHandler from '@/utils/TuyaCloudApiHandler';
import clientPromise from '@/utils/mongodb';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({
            status: 401,
            message: 'Unauthorized',
        });
    }
    try {
        const client = await clientPromise;
        const db = client.db("homeStats");
        const collection = db.collection("smartStrip")
        
        const ApiHandler = singletonTuyaAPIHandler;
        const data = await singletonTuyaAPIHandler.getData();
        const curCurrent = data.find((item: any) => item.code === 'cur_current').value;
        const curPower = data.find((item: any) => item.code === 'cur_power').value;
        const curVoltage = data.find((item: any) => item.code === 'cur_voltage').value;
        const dataForMongo = {
            current: curCurrent,
            voltage: curVoltage,
            power: curPower,
            ts: new Date(),
        }
        const result = await collection.insertOne(dataForMongo);

        return NextResponse.json({
            status: 200,
            data: result,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({
            status: 500,
            error: "Internal Server Error",
        });
    }
}