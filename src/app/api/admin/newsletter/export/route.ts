import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { escapeCsvCell } from '@/lib/validation/newsletter';

export async function GET(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ message: 'Sign in first.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const rawStatus = searchParams.get('status') ?? 'SUBSCRIBED';
  const where =
    rawStatus === 'SUBSCRIBED' || rawStatus === 'UNSUBSCRIBED' ? { status: rawStatus as 'SUBSCRIBED' | 'UNSUBSCRIBED' } : {};

  const rows = await db.newsletterSubscriber.findMany({
    where,
    orderBy: { subscribedAt: 'desc' },
    select: { email: true, name: true, status: true, source: true, subscribedAt: true },
  });

  const header = ['email', 'name', 'status', 'source', 'subscribedAt'].join(',');
  const lines = rows.map((row) =>
    [
      escapeCsvCell(row.email),
      escapeCsvCell(row.name),
      escapeCsvCell(row.status),
      escapeCsvCell(row.source),
      escapeCsvCell(row.subscribedAt.toISOString()),
    ].join(','),
  );
  const csv = [header, ...lines].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sbg-ucc-newsletter-subscribers.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
