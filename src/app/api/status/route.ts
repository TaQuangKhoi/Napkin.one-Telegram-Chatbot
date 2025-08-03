import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const redisPing = await redis.ping();
    const status = {
      status: 'ok',
      time: new Date().toISOString(),
      redis: redisPing === 'PONG' ? 'ok' : 'error',
    };
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ status: 'error', redis: 'disconnected' }, { status: 500 });
  }
}