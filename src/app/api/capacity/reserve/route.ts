import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const ReserveSchema = z.object({
  slotStart: z.string().datetime(),
  providerId: z.string(),
});

const MAX_RETRIES = 3;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = ReserveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { slotStart, providerId } = parsed.data;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const bucket = await db.capacityBucket.findUnique({
      where: { providerId_slotStart: { providerId, slotStart: new Date(slotStart) } },
    });

    if (!bucket) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (bucket.booked >= bucket.maxCapacity) {
      return NextResponse.json({ error: 'Slot is full' }, { status: 409 });
    }

    // Optimistic lock: only update if version matches
    const updated = await db.capacityBucket.updateMany({
      where: {
        id: bucket.id,
        version: bucket.version,
        booked: { lt: bucket.maxCapacity },
      },
      data: {
        booked: { increment: 1 },
        version: { increment: 1 },
      },
    });

    if (updated.count === 1) {
      return NextResponse.json({ success: true, slotStart, remaining: bucket.maxCapacity - bucket.booked - 1 });
    }
    // Version conflict — retry
  }

  return NextResponse.json({ error: 'Conflict, please retry' }, { status: 409 });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = ReserveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { slotStart, providerId } = parsed.data;

  await db.capacityBucket.updateMany({
    where: {
      providerId,
      slotStart: new Date(slotStart),
      booked: { gt: 0 },
    },
    data: { booked: { decrement: 1 } },
  });

  return NextResponse.json({ success: true });
}
