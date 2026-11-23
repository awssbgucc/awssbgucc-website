'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

type CollectPayload = {
  eventType: 'pageview' | 'cta_click';
  path: string;
  label?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function sendEvent(payload: CollectPayload) {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const sent = navigator.sendBeacon('/api/analytics/collect', new Blob([body], { type: 'application/json' }));
      if (sent) return;
    }
  } catch {
    // Fall back to keepalive fetch below.
  }

  void fetch('/api/analytics/collect', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

function classifyClickTarget(target: Element): string | null {
  const explicit = target.getAttribute('data-track-cta');
  if (explicit && explicit.trim()) return explicit.trim().slice(0, 120);

  const href = target.getAttribute('href') ?? '';
  if (!href) return null;

  if (href.includes('meetup.com')) return 'Join on Meetup';
  if (href.includes('chat.whatsapp.com')) return 'Join WhatsApp';
  if (href === '/builder' || href.startsWith('/builder/') || href === '/sign-in') return 'Builder Portal';
  if (href.includes('credly.com')) return 'Credly badge';
  if (href.includes('builder.aws.com')) return 'AWS Builder Center';
  if (href.includes('linkedin.com')) return 'Social: LinkedIn';
  if (href.includes('instagram.com')) return 'Social: Instagram';
  if (href.includes('x.com') || href.includes('twitter.com')) return 'Social: X';
  if (href.includes('github.com')) return 'Social: GitHub';
  return null;
}

export function AnalyticsTracker() {
  const pathname = usePathname() || '/';
  const lastTrackedRef = useRef<{ path: string; at: number } | null>(null);
  const entryContextSentRef = useRef(false);

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/monitoring')) {
      return;
    }

    const now = Date.now();
    const last = lastTrackedRef.current;
    if (last && last.path === pathname && now - last.at < 1500) {
      return;
    }
    lastTrackedRef.current = { path: pathname, at: now };

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const includeEntryReferrer = !entryContextSentRef.current;
    entryContextSentRef.current = true;

    sendEvent({
      eventType: 'pageview',
      path: pathname,
      referrer: includeEntryReferrer && typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      utmSource: params?.get('utm_source') ?? undefined,
      utmMedium: params?.get('utm_medium') ?? undefined,
      utmCampaign: params?.get('utm_campaign') ?? undefined,
    });
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest('[data-track-cta], a[href]') : null;
      if (!target) return;

      const label = classifyClickTarget(target);
      if (!label) return;

      sendEvent({
        eventType: 'cta_click',
        path: pathname || '/',
        label,
      });
    }

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
