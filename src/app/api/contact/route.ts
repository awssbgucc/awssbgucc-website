import { NextResponse } from 'next/server';
import { recordServerAnalyticsEvent } from '@/lib/analytics';
import { getSiteSettings } from '@/lib/content/queries';
import { sendContactEmail } from '@/lib/email/resend';
import { errorMessage, logError } from '@/lib/log';
import { withinLimit } from '@/lib/platform/records';
import { contactSchema } from '@/lib/validation/contact';

const BODY_LIMIT = 16_000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;

async function readUpTo(request: Request, limit: number) {
  if (Number(request.headers.get('content-length') ?? 0) > limit) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64);
  return (request.headers.get('x-real-ip') ?? 'unknown').trim().slice(0, 64);
}

export async function POST(request: Request) {
  const text = await readUpTo(request, BODY_LIMIT);
  if (text === null) {
    return NextResponse.json({ ok: false, message: 'Message payload is too large.' }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request format.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'message');
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors, message: 'Check the highlighted fields and try again.' }, { status: 400 });
  }

  // Silently accept honeypot submissions so automated bots stop retrying.
  if (parsed.data.website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  try {
    const allowed = await withinLimit(`contact:${clientIp(request)}`, RATE_MAX, RATE_WINDOW_MS);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: 'You have sent several messages recently. Wait a few minutes or email us directly.' },
        { status: 429 },
      );
    }
  } catch (error) {
    // Do not block a legitimate contact message if the rate-limit table is momentarily unavailable.
    logError('contact_rate_limit_error', { message: errorMessage(error) });
  }

  const settings = await getSiteSettings();
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || settings.email;

  try {
    const result = await sendContactEmail(parsed.data, recipient);
    if (result.ok) {
      await recordServerAnalyticsEvent({
        eventType: 'contact_submit',
        path: '/contact',
        label: parsed.data.topic,
        request,
      });
      return NextResponse.json({ ok: true });
    }
    if (result.code === 'NOT_CONFIGURED') {
      logError('contact_resend_unconfigured', { topic: parsed.data.topic });
      return NextResponse.json(
        {
          ok: false,
          code: 'NOT_CONFIGURED',
          message: `The contact form is not connected to email delivery yet. You can send your message directly to ${recipient}.`,
        },
        { status: 503 },
      );
    }
    logError('contact_resend_failed', { status: result.status, detail: result.detail });
    return NextResponse.json(
      {
        ok: false,
        code: 'DELIVERY_FAILED',
        message: `We could not deliver your message right now. Please try again or email us directly at ${recipient}.`,
      },
      { status: 502 },
    );
  } catch (error) {
    logError('contact_send_error', { message: errorMessage(error) });
    return NextResponse.json(
      {
        ok: false,
        code: 'DELIVERY_FAILED',
        message: `We could not deliver your message right now. Please try again or email us directly at ${recipient}.`,
      },
      { status: 502 },
    );
  }
}
