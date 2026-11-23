import { NextResponse } from 'next/server';
import {
  analyticsPayloadSchema,
  analyticsSecret,
  dailyVisitorHash,
  detectDeviceType,
  extractReferrerHost,
  isBotUserAgent,
  normalisePath,
  shouldTrackPath,
} from '@/lib/analytics';
import { db } from '@/lib/db';
import { clientIp, readBodyUpTo } from '@/lib/http';
import { withinLimit } from '@/lib/platform/records';

const BODY_LIMIT = 2048;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 120;

export async function POST(request: Request) {
  const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 300);
  if (isBotUserAgent(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await readBodyUpTo(request, BODY_LIMIT);
  if (text === null) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = analyticsPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = normalisePath(parsed.data.path);
  if (!shouldTrackPath(path)) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = clientIp(request);
  try {
    const allowed = await withinLimit(`analytics:${ip}`, RATE_MAX, RATE_WINDOW_MS);
    if (!allowed) {
      return new NextResponse(null, { status: 204 });
    }
  } catch {
    // Do not drop visits if rate limit storage is momentarily busy.
  }

  const ownHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const referrerHost = extractReferrerHost(parsed.data.referrer, ownHost);
  const dayIso = new Date().toISOString().slice(0, 10);

  await db.analyticsEvent.create({
    data: {
      eventType: parsed.data.eventType,
      path,
      label: parsed.data.eventType === 'cta_click' ? parsed.data.label : null,
      referrerHost,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
      deviceType: detectDeviceType(userAgent),
      visitorHash: dailyVisitorHash(ip, userAgent, dayIso, analyticsSecret()),
    },
  });

  return new NextResponse(null, { status: 204 });
}
