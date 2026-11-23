import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { escapeCsvCell } from '@/lib/validation/newsletter';

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ message: 'Sign in first.' }, { status: 401 });

  const items = await db.swagItem.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });

  const header = ['name', 'category', 'quantity', 'unitLabel', 'receivedTotal', 'distributedTotal', 'lowStockThreshold', 'notes', 'updatedBy', 'updatedAt'].join(',');
  const lines = items.map((item) =>
    [
      escapeCsvCell(item.name),
      escapeCsvCell(item.category),
      String(item.quantity),
      escapeCsvCell(item.unitLabel),
      String(item.receivedTotal),
      String(item.distributedTotal),
      String(item.lowStockThreshold),
      escapeCsvCell(item.notes),
      escapeCsvCell(item.updatedBy),
      escapeCsvCell(item.updatedAt.toISOString()),
    ].join(','),
  );

  const csv = [header, ...lines].join('\r\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sbg-ucc-swag-inventory.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
