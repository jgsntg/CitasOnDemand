import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkOrgId = orgId ?? userId;

  let provider = await db.provider.findUnique({ where: { clerkOrgId } });

  if (!provider) {
    provider = await db.provider.create({
      data: {
        clerkOrgId,
        name: 'My Business',
        timezone: 'America/New_York',
        currency: 'USD',
      },
    });
  }

  return NextResponse.json(provider);
}

export async function PATCH(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clerkOrgId = orgId ?? userId;
  const body = await req.json();

  const provider = await db.provider.update({
    where: { clerkOrgId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.timezone && { timezone: body.timezone }),
      ...(body.currency && { currency: body.currency }),
    },
  });

  return NextResponse.json(provider);
}
