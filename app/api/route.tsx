import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      status: 200,
      revalidated: true,
      now: Date.now(),
      message: "Hello world from API"
    })
  } catch (err: unknown) {
    console.error(err)
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 })
    }
    return new Response('Error', { status: 500 })
  }
}
