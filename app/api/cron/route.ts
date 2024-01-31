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
        const data = {
            current: 0, 
            voltage: 236,
            power: 0,
            ts: new Date(),
        }

        const result = await collection.insertOne(data);

        return NextResponse.json({
            status: 200,
            now: Date.now(),
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