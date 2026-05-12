import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateSlotsForDay, daysAhead } from '@/lib/capacity';

const DaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacityPerHour: z.number().int().min(1).max(100),
  isActive: z.boolean(),
});

const PutSchema = z.array(DaySchema);

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkOrgId = orgId ?? userId;
  const provider = await db.provider.findUnique({ where: { clerkOrgId } });
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

  const schedules = await db.workingHours.findMany({
    where: { providerId: provider.id },
    orderBy: { dayOfWeek: 'asc' },
  });

  return NextResponse.json(schedules);
}

export async function PUT(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkOrgId = orgId ?? userId;
  const provider = await db.provider.findUnique({ where: { clerkOrgId } });
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

  const body = await req.json();
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const days = parsed.data;
  const BUCKET_DAYS = 60;
  const futureDays = daysAhead(BUCKET_DAYS);

  await db.$transaction(async (tx) => {
    // Replace all working hours for this provider
    await tx.workingHours.deleteMany({ where: { providerId: provider.id } });

    const createdSchedules = await Promise.all(
      days.map((day) =>
        tx.workingHours.create({
          data: {
            providerId: provider.id,
            dayOfWeek: day.dayOfWeek,
            openTime: day.openTime,
            closeTime: day.closeTime,
            capacityPerHour: day.capacityPerHour,
            isActive: day.isActive,
          },
        }),
      ),
    );

    // Delete future capacity buckets and regenerate from new schedule
    await tx.capacityBucket.deleteMany({
      where: {
        providerId: provider.id,
        slotStart: { gte: new Date() },
      },
    });

    const buckets = [];
    for (const schedule of createdSchedules) {
      if (!schedule.isActive) continue;
      for (const day of futureDays) {
        const slots = generateSlotsForDay(
          day,
          schedule.dayOfWeek,
          schedule.openTime,
          schedule.closeTime,
          provider.timezone,
        );
        for (const slot of slots) {
          buckets.push({
            providerId: provider.id,
            workingHoursId: schedule.id,
            slotStart: slot.slotStart,
            slotEnd: slot.slotEnd,
            maxCapacity: schedule.capacityPerHour,
            booked: 0,
            version: 0,
          });
        }
      }
    }

    if (buckets.length > 0) {
      await tx.capacityBucket.createMany({ data: buckets, skipDuplicates: true });
    }
  });

  const updated = await db.workingHours.findMany({
    where: { providerId: provider.id },
    orderBy: { dayOfWeek: 'asc' },
  });

  return NextResponse.json(updated);
}
