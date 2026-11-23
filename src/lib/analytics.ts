import { createHmac } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { clientIp } from '@/lib/http';

export type AnalyticsDevice = 'desktop' | 'mobile' | 'tablet';
export type ServerAnalyticsEventType = 'newsletter_subscribe' | 'contact_submit';

export const analyticsPayloadSchema = z.object({
  eventType: z.enum(['pageview', 'cta_click']),
  path: z
    .string()
    .trim()
    .min(1)
    .max(240)
    .refine((value) => value.startsWith('/'), 'Path must start with /'),
  label: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  referrer: z.string().trim().max(500).optional(),
  utmSource: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  utmMedium: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  utmCampaign: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

const BOT_UA_RE = /bot\b|crawl|spider|slurp|headless|lighthouse|pagespeed|pingdom|uptimerobot|curl\/|wget\/|python-requests|go-http-client/i;
const EXCLUDED_PREFIXES = ['/admin', '/api', '/monitoring', '/_next'];

export function isBotUserAgent(userAgent: string): boolean {
  if (!userAgent.trim()) return true;
  return BOT_UA_RE.test(userAgent);
}

export function normalisePath(raw: string): string {
  const withoutHash = raw.split('#')[0] ?? '';
  const withoutQuery = withoutHash.split('?')[0] ?? '';
  const trimmed = withoutQuery.trim();
  if (!trimmed) return '/';
  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const collapsed = withLeading.replace(/\/{2,}/g, '/');
  const trimmedTrailing = collapsed.length > 1 && collapsed.endsWith('/') ? collapsed.slice(0, -1) : collapsed;
  return trimmedTrailing.slice(0, 240);
}

export function shouldTrackPath(path: string): boolean {
  const normalised = normalisePath(path);
  return !EXCLUDED_PREFIXES.some((prefix) => normalised === prefix || normalised.startsWith(`${prefix}/`));
}

export function extractReferrerHost(referrer: string | null | undefined, ownHost: string | null): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return null;
    if (ownHost) {
      const cleanOwn = ownHost.split(':')[0].toLowerCase().replace(/^www\./, '');
      if (host === cleanOwn) return null;
    }
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export function detectDeviceType(userAgent: string): AnalyticsDevice {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function dailyVisitorHash(ip: string, userAgent: string, dayIso: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${dayIso}|${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 24);
}

export function analyticsSecret(): string {
  return process.env.AUTH_SECRET?.trim() || 'sbg-ucc-analytics';
}

export async function recordServerAnalyticsEvent({
  eventType,
  path,
  label,
  request,
}: {
  eventType: ServerAnalyticsEventType;
  path: string;
  label?: string | null;
  request: Request;
}) {
  try {
    const ip = clientIp(request);
    const ua = (request.headers.get('user-agent') ?? '').slice(0, 300);
    const dayIso = new Date().toISOString().slice(0, 10);
    const visitorHash = dailyVisitorHash(ip, ua, dayIso, analyticsSecret());
    const ownHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    const referrerHost = extractReferrerHost(request.headers.get('referer'), ownHost);

    await db.analyticsEvent.create({
      data: {
        eventType,
        path: normalisePath(path),
        label: label ? label.slice(0, 120) : null,
        referrerHost,
        deviceType: detectDeviceType(ua),
        visitorHash,
      },
    });
  } catch {
    // Analytics must never block or fail a primary user submission.
  }
}
