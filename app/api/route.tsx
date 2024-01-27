import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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

  return NextResponse.json({
    status: 200,
    now: Date.now(),
    message: 'Hello world from API',
  });
}
