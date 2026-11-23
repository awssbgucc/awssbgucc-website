import { Eye, Monitor, MousePointerClick, Smartphone, Sparkles, Tablet, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, FilterPills, PageHeader, Panel, StatCard } from '@/components/admin/ui';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Analytics' };

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGES = {
  '7d': { days: 7, label: '7 days' },
  '30d': { days: 30, label: '30 days' },
  '90d': { days: 90, label: '90 days' },
} as const;

type RangeKey = keyof typeof RANGES;

function resolveRange(raw: string | undefined): RangeKey {
  if (raw === '7d' || raw === '30d' || raw === '90d') return raw;
  return '30d';
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shortDayLabel(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function sortedEntries(map: Map<string, number>, limit?: number) {
  const items = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return limit ? items.slice(0, limit) : items;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireRole();

  const { range: rawRange } = await searchParams;
  const rangeKey = resolveRange(rawRange);
  const { days } = RANGES[rangeKey];

  const today = new Date();
  const endUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const startUtc = new Date(endUtc.getTime() - (days - 1) * DAY_MS);

  const events = await db.analyticsEvent.findMany({
    where: { createdAt: { gte: startUtc } },
    select: {
      eventType: true,
      path: true,
      label: true,
      referrerHost: true,
      utmSource: true,
      utmCampaign: true,
      deviceType: true,
      visitorHash: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const pageviews = events.filter((event) => event.eventType === 'pageview');
  const ctaClicks = events.filter((event) => event.eventType === 'cta_click');
  const newsletterSignups = events.filter((event) => event.eventType === 'newsletter_subscribe').length;
  const contactSubmits = events.filter((event) => event.eventType === 'contact_submit').length;

  const totalViews = pageviews.length;
  const uniqueVisitors = new Set(pageviews.map((event) => event.visitorHash)).size;
  const avgViewsPerDay = (totalViews / days).toFixed(1);
  const pagesPerVisitor = uniqueVisitors > 0 ? (totalViews / uniqueVisitors).toFixed(1) : '0.0';
  const totalConversions = newsletterSignups + contactSubmits;

  const dailyBuckets: { iso: string; label: string; views: number; visitors: Set<string> }[] = [];
  const dailyMap = new Map<string, { iso: string; label: string; views: number; visitors: Set<string> }>();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(startUtc.getTime() + i * DAY_MS);
    const iso = dayKey(date);
    const bucket = { iso, label: shortDayLabel(iso), views: 0, visitors: new Set<string>() };
    dailyBuckets.push(bucket);
    dailyMap.set(iso, bucket);
  }

  const pageViewsByPath = new Map<string, number>();
  const pageVisitorsByPath = new Map<string, Set<string>>();
  const referrerCounts = new Map<string, number>();
  const utmCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();

  for (const view of pageviews) {
    const iso = dayKey(view.createdAt);
    const bucket = dailyMap.get(iso);
    if (bucket) {
      bucket.views += 1;
      bucket.visitors.add(view.visitorHash);
    }

    pageViewsByPath.set(view.path, (pageViewsByPath.get(view.path) ?? 0) + 1);
    let pathVisitors = pageVisitorsByPath.get(view.path);
    if (!pathVisitors) {
      pathVisitors = new Set<string>();
      pageVisitorsByPath.set(view.path, pathVisitors);
    }
    pathVisitors.add(view.visitorHash);

    const source = view.referrerHost ?? 'Direct or internal';
    referrerCounts.set(source, (referrerCounts.get(source) ?? 0) + 1);

    if (view.utmSource) {
      const utmKey = view.utmCampaign ? `${view.utmSource} / ${view.utmCampaign}` : view.utmSource;
      utmCounts.set(utmKey, (utmCounts.get(utmKey) ?? 0) + 1);
    }

    deviceCounts.set(view.deviceType, (deviceCounts.get(view.deviceType) ?? 0) + 1);
  }

  const actionCounts = new Map<string, number>();
  for (const click of ctaClicks) {
    const key = click.label ?? 'Community link';
    actionCounts.set(key, (actionCounts.get(key) ?? 0) + 1);
  }
  if (newsletterSignups > 0) {
    actionCounts.set('Newsletter subscriptions', newsletterSignups);
  }
  if (contactSubmits > 0) {
    actionCounts.set('Contact form submissions', contactSubmits);
  }

  const topPages = sortedEntries(pageViewsByPath, 10);
  const topReferrers = sortedEntries(referrerCounts, 8);
  const topUtms = sortedEntries(utmCounts, 6);
  const topActions = sortedEntries(actionCounts, 10);
  const topClickLabel = sortedEntries(
    ctaClicks.reduce((acc, click) => {
      const key = click.label ?? 'Community link';
      acc.set(key, (acc.get(key) ?? 0) + 1);
      return acc;
    }, new Map<string, number>()),
    1,
  )[0]?.[0];

  const maxDailyViews = Math.max(1, ...dailyBuckets.map((bucket) => bucket.views));
  const midBucket = dailyBuckets[Math.floor(dailyBuckets.length / 2)];
  const hasTraffic = events.length > 0;

  const deviceRows: { key: 'desktop' | 'mobile' | 'tablet'; label: string; count: number }[] = [
    { key: 'desktop', label: 'Desktop', count: deviceCounts.get('desktop') ?? 0 },
    { key: 'mobile', label: 'Mobile', count: deviceCounts.get('mobile') ?? 0 },
    { key: 'tablet', label: 'Tablet', count: deviceCounts.get('tablet') ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title="Site analytics"
        description="Cookie-free first-party visit counts, traffic sources, devices and tracked community actions."
        secondaryAction={{ href: '/admin/reports', label: 'Member reports' }}
      />

      <FilterPills
        label="Date range"
        items={(Object.keys(RANGES) as RangeKey[]).map((key) => ({
          label: RANGES[key].label,
          href: `/admin/analytics?range=${key}`,
          active: rangeKey === key,
        }))}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Page views"
          value={totalViews}
          hint={`${avgViewsPerDay} avg views per day`}
          icon={<Eye aria-hidden size={18} />}
          tone="lime"
        />
        <StatCard
          label="Unique visitors"
          value={uniqueVisitors}
          hint={`${pagesPerVisitor} pages per visitor`}
          icon={<Users aria-hidden size={18} />}
          tone="blue"
        />
        <StatCard
          label="CTA clicks"
          value={ctaClicks.length}
          hint={topClickLabel ? `Top: ${topClickLabel}` : 'No CTA clicks yet'}
          icon={<MousePointerClick aria-hidden size={18} />}
          tone="purple"
        />
        <StatCard
          label="Conversions"
          value={totalConversions}
          hint={`${newsletterSignups} newsletter, ${contactSubmits} contact`}
          icon={<Sparkles aria-hidden size={18} />}
          tone="magenta"
        />
      </div>

      {!hasTraffic ? (
        <div className="mt-8">
          <Empty icon={<TrendingUp aria-hidden size={18} />} action={{ href: '/', label: 'Visit public site' }}>
            No site visits have been recorded in the last {RANGES[rangeKey].label}. Public page views, CTA clicks and form conversions will appear here automatically.
          </Empty>
        </div>
      ) : (
        <>
          <Panel
            className="mt-6"
            title="Daily traffic"
            description={`Views and daily unique visitors across the last ${RANGES[rangeKey].label}.`}
            action={
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="size-2.5 rounded-xs bg-lime" />
                  Views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="size-2.5 rounded-xs bg-blue" />
                  Visitors
                </span>
              </div>
            }
          >
            <div
              className={`flex h-44 items-end border-b border-border pb-2 ${days > 30 ? 'gap-0.5' : 'gap-1 sm:gap-1.5'}`}
              role="img"
              aria-label={`Daily traffic bars covering ${totalViews} views over ${days} days`}
            >
              {dailyBuckets.map((bucket) => {
                const visitorCount = bucket.visitors.size;
                const viewHeight = bucket.views > 0 ? Math.max(6, Math.round((bucket.views / maxDailyViews) * 100)) : 0;
                const visitorHeight = visitorCount > 0 ? Math.max(4, Math.round((visitorCount / maxDailyViews) * 100)) : 0;
                return (
                  <div
                    key={bucket.iso}
                    title={`${bucket.label}: ${bucket.views} views, ${visitorCount} visitors`}
                    className="group relative flex h-full flex-1 items-end justify-center rounded-xs bg-bg-alt/50 transition-colors hover:bg-hover-tint"
                  >
                    {bucket.views > 0 && (
                      <div
                        className="w-full rounded-t-xs bg-lime/80 transition-opacity group-hover:bg-lime"
                        style={{ height: `${viewHeight}%` }}
                      />
                    )}
                    {visitorCount > 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 mx-auto w-[45%] rounded-t-xs bg-blue/90"
                        style={{ height: `${visitorHeight}%` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center justify-between font-display text-[11px] text-text-muted">
              <span>{dailyBuckets[0]?.label}</span>
              <span>{midBucket?.label}</span>
              <span>{dailyBuckets[dailyBuckets.length - 1]?.label}</span>
            </div>
          </Panel>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Top pages" description="Most viewed routes in this period.">
              {topPages.length === 0 ? (
                <p className="text-sm text-text-muted">No page views yet.</p>
              ) : (
                <ul className="space-y-3.5 text-sm">
                  {topPages.map(([pagePath, count]) => {
                    const max = topPages[0]?.[1] ?? 1;
                    const width = `${Math.max(8, Math.round((count / max) * 100))}%`;
                    const visitors = pageVisitorsByPath.get(pagePath)?.size ?? 0;
                    return (
                      <li key={pagePath} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <Link href={pagePath} className="truncate font-display text-xs font-medium text-text-strong hover:text-lime hover:underline">
                            {pagePath}
                          </Link>
                          <span className="shrink-0 font-display text-xs text-text-muted tabular-nums">
                            {count} views / {visitors} visitors
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-alt">
                          <div className="h-full rounded-full bg-lime" style={{ width }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel title="Traffic sources" description="Referring domains and campaign tags.">
              {topReferrers.length === 0 ? (
                <p className="text-sm text-text-muted">No referrer data yet.</p>
              ) : (
                <ul className="space-y-3.5 text-sm">
                  {topReferrers.map(([host, count]) => {
                    const max = topReferrers[0]?.[1] ?? 1;
                    const width = `${Math.max(8, Math.round((count / max) * 100))}%`;
                    return (
                      <li key={host} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-text-strong">{host}</span>
                          <span className="shrink-0 font-display text-xs text-text-muted tabular-nums">{count}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-alt">
                          <div className="h-full rounded-full bg-blue" style={{ width }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {topUtms.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <p className="mb-2.5 text-xs font-medium tracking-wider uppercase text-text-muted">UTM campaigns</p>
                  <ul className="space-y-2 text-xs">
                    {topUtms.map(([campaign, count]) => (
                      <li key={campaign} className="flex items-center justify-between gap-3">
                        <span className="truncate font-display text-text">{campaign}</span>
                        <span className="font-display text-text-muted tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Panel>

            <Panel title="Devices" description="Share of page views by screen form factor.">
              {totalViews === 0 ? (
                <p className="text-sm text-text-muted">No device data yet.</p>
              ) : (
                <ul className="space-y-4 text-sm">
                  {deviceRows.map(({ key, label, count }) => {
                    const share = Math.round((count / totalViews) * 100);
                    const width = count > 0 ? `${Math.max(4, share)}%` : '0%';
                    const DeviceIcon = key === 'desktop' ? Monitor : key === 'mobile' ? Smartphone : Tablet;
                    return (
                      <li key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-text-strong">
                            <DeviceIcon aria-hidden size={15} className="text-text-muted" />
                            {label}
                          </span>
                          <span className="font-display text-xs text-text-muted tabular-nums">
                            {count} ({share}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-alt">
                          <div className="h-full rounded-full bg-blue" style={{ width }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel title="Tracked actions and conversions" description="Key links clicked and forms completed.">
              {topActions.length === 0 ? (
                <p className="text-sm text-text-muted">No tracked actions recorded yet.</p>
              ) : (
                <ul className="space-y-3.5 text-sm">
                  {topActions.map(([actionLabel, count]) => {
                    const max = topActions[0]?.[1] ?? 1;
                    const width = `${Math.max(8, Math.round((count / max) * 100))}%`;
                    return (
                      <li key={actionLabel} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="truncate text-text-strong">{actionLabel}</span>
                          <span className="shrink-0 font-display text-xs text-text-muted tabular-nums">{count}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-alt">
                          <div className="h-full rounded-full bg-purple" style={{ width }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
