import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { readBodyUpTo } from '@/lib/http';

const BODY_LIMIT = 4_000;

const unsubscribeSchema = z.object({
  token: z.string().trim().min(8, 'Missing unsubscribe token.').max(120),
  action: z.enum(['unsubscribe', 'resubscribe']).default('unsubscribe'),
});

export async function POST(request: Request) {
  const text = await readBodyUpTo(request, BODY_LIMIT);
  if (text === null) {
    return NextResponse.json({ ok: false, message: 'Request payload is too large.' }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request format.' }, { status: 400 });
  }

  const parsed = unsubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'This unsubscribe link is invalid.' }, { status: 400 });
  }

  const subscriber = await db.newsletterSubscriber.findUnique({ where: { unsubscribeToken: parsed.data.token } });
  if (!subscriber) {
    return NextResponse.json({ ok: false, message: 'This unsubscribe link could not be found.' }, { status: 404 });
  }

  const nextStatus = parsed.data.action === 'resubscribe' ? 'SUBSCRIBED' : 'UNSUBSCRIBED';
  const updated = await db.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: {
      status: nextStatus,
      unsubscribedAt: nextStatus === 'UNSUBSCRIBED' ? new Date() : null,
      ...(nextStatus === 'SUBSCRIBED' ? { subscribedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    status: updated.status,
    email: updated.email,
  });
}
