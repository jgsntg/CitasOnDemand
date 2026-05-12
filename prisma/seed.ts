import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { generateSlotsForDay, daysAhead } from '../src/lib/capacity';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const CLERK_ORG_ID = 'seed_provider_001';
  const TIMEZONE = 'America/New_York';
  const BUCKET_DAYS = 60;

  const provider = await db.provider.upsert({
    where: { clerkOrgId: CLERK_ORG_ID },
    update: {},
    create: {
      clerkOrgId: CLERK_ORG_ID,
      name: 'Demo Business',
      timezone: TIMEZONE,
      currency: 'USD',
    },
  });

  console.log(`Provider: ${provider.id}`);

  // Mon–Fri, 9am–5pm, 3 slots/hour
  const schedule = [
    { dayOfWeek: 1, openTime: '09:00', closeTime: '17:00', capacityPerHour: 3 },
    { dayOfWeek: 2, openTime: '09:00', closeTime: '17:00', capacityPerHour: 3 },
    { dayOfWeek: 3, openTime: '09:00', closeTime: '17:00', capacityPerHour: 3 },
    { dayOfWeek: 4, openTime: '09:00', closeTime: '17:00', capacityPerHour: 3 },
    { dayOfWeek: 5, openTime: '09:00', closeTime: '17:00', capacityPerHour: 3 },
  ];

  await db.workingHours.deleteMany({ where: { providerId: provider.id } });
  await db.capacityBucket.deleteMany({ where: { providerId: provider.id } });

  const futureDays = daysAhead(BUCKET_DAYS);

  for (const s of schedule) {
    const wh = await db.workingHours.create({
      data: {
        providerId: provider.id,
        dayOfWeek: s.dayOfWeek,
        openTime: s.openTime,
        closeTime: s.closeTime,
        capacityPerHour: s.capacityPerHour,
        isActive: true,
      },
    });

    const buckets = [];
    for (const day of futureDays) {
      const slots = generateSlotsForDay(day, s.dayOfWeek, s.openTime, s.closeTime, TIMEZONE);
      for (const slot of slots) {
        buckets.push({
          providerId: provider.id,
          workingHoursId: wh.id,
          slotStart: slot.slotStart,
          slotEnd: slot.slotEnd,
          maxCapacity: s.capacityPerHour,
          booked: 0,
          version: 0,
        });
      }
    }

    if (buckets.length > 0) {
      await db.capacityBucket.createMany({ data: buckets, skipDuplicates: true });
    }

    console.log(`  Day ${s.dayOfWeek}: ${buckets.length} buckets created`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
