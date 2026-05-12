import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkOrgId = orgId ?? userId;
  const provider = await db.provider.findUnique({ where: { clerkOrgId } });
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to query params required (ISO 8601)' }, { status: 400 });
  }

  const buckets = await db.capacityBucket.findMany({
    where: {
      providerId: provider.id,
      slotStart: { gte: new Date(from), lte: new Date(to) },
    },
    orderBy: { slotStart: 'asc' },
  });

  const result = buckets.map((b) => ({
    slotStart: b.slotStart,
    slotEnd: b.slotEnd,
    maxCapacity: b.maxCapacity,
    booked: b.booked,
    available: b.maxCapacity - b.booked,
  }));

  return NextResponse.json(result);
}
