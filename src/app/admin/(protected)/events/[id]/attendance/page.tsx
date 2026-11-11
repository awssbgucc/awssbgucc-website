import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { AdminForm } from '@/components/admin/AdminForm';
import { TextField } from '@/components/admin/fields';
import { LINK, PageHeader, TABLE, TableWrap, TD, TH, ToggleButton } from '@/components/admin/ui';
import { Badge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate, formatTime, formatTimeRange } from '@/lib/format';
import { checkInState, defaultCheckInWindow } from '@/lib/platform/rules';
import { SITE_URL } from '@/lib/site';
import { dateToAccraInput } from '@/lib/validation/shared';
import { addAttendee, closeCheckIn, newCheckInCode, openCheckIn, openCheckInNow, removeAttendee, useCheckInCount } from '../../attendance-actions';

export const metadata: Metadata = { title: 'Check-in and attendance' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ display?: string }> };

export default async function AttendancePage({ params, searchParams }: Props) {
  await requireRole();
  const { id } = await params;
  const { display } = await searchParams;
  const event = await db.event.findUnique({
    where: { id },
    include: { checkIns: { orderBy: { createdAt: 'asc' }, include: { user: { select: { email: true, profile: { select: { displayName: true, handle: true } } } } } } },
  });
  if (!event) notFound();
  const now = new Date();
  const state = checkInState(event, now);
  const link = event.checkInCode ? `${SITE_URL}/builder/check-in?event=${event.slug}&code=${event.checkInCode}` : null;
  const qr = link ? await QRCode.toDataURL(link, { margin: 1, width: 640, color: { dark: '#161d26', light: '#ffffff' } }) : null;

  // The projector view: the code and the QR code, large, and nothing else.
  if (display && event.checkInCode && qr) {
    return (
      <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-10 text-center">
        <p className="type-label text-lime">Check in: {event.title}</p>
        <p className="font-display text-7xl font-medium tracking-[0.25em] text-white sm:text-9xl">{event.checkInCode}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- a generated data URL, not a remote image */}
        <img src={qr} alt="QR code for check-in" className="w-64 rounded-md bg-white p-3 sm:w-80" />
        <p className="max-w-[40ch] text-lg text-text-muted">Sign in at the builder portal, open Check in, and enter the code. Or scan the QR code.</p>
        <Link href={`/admin/events/${event.id}/attendance`} className={`${LINK} text-sm`}>
          Back to attendance
        </Link>
      </div>
    );
  }

  const window = event.checkInOpensAt && event.checkInClosesAt ? { opensAt: event.checkInOpensAt, closesAt: event.checkInClosesAt } : defaultCheckInWindow(event.startsAt, event.endsAt);

  return (
    <>
      <Link href={`/admin/events/${event.id}`} className={`${LINK} mb-2 inline-flex min-h-11 items-center text-sm`}>
        Edit event
      </Link>
      <PageHeader title="Check-in and attendance" />
      <p className="mb-8 text-text-muted">
        {event.title}, {formatDate(event.startsAt)}, {formatTimeRange(event.startsAt, event.endsAt)}
      </p>

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <section className="rounded-md border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Check-in</h2>
            <Badge tone={state === 'open' ? 'lime' : 'neutral'}>{{ 'not-set': 'Not set up', 'not-open': 'Scheduled', open: 'Open', closed: 'Closed' }[state]}</Badge>
          </div>
          {event.status !== 'PUBLISHED' ? (
            <p className="mt-4 text-sm text-text-muted">Publish the event before opening check-in.</p>
          ) : (
            <>
              {event.checkInCode && (
                <div className="mt-6 flex flex-wrap items-center gap-8">
                  <div>
                    <p className="type-label text-text-muted">Code</p>
                    <p className="font-display text-5xl font-medium tracking-[0.2em] text-white">{event.checkInCode}</p>
                    {event.checkInOpensAt && event.checkInClosesAt && (
                      <p className="mt-2 font-display text-xs text-text-muted">
                        {formatDate(event.checkInOpensAt)} {formatTime(event.checkInOpensAt)} to {formatDate(event.checkInClosesAt)} {formatTime(event.checkInClosesAt)}
                      </p>
                    )}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a generated data URL, not a remote image */}
                  {qr && <img src={qr} alt="QR code for check-in" className="w-36 rounded-sm bg-white p-2" />}
                </div>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                {state !== 'open' && <ToggleButton action={openCheckInNow.bind(null, event.id)} label="Open check-in now" />}
                {state === 'open' && <ToggleButton action={closeCheckIn.bind(null, event.id)} label="Close check-in" />}
                {event.checkInCode && <ToggleButton action={newCheckInCode.bind(null, event.id)} label="Make a new code" />}
                {event.checkInCode && (
                  <Link href={`/admin/events/${event.id}/attendance?display=1`} className={`${LINK} inline-flex min-h-11 items-center text-sm underline`}>
                    Show on the projector
                  </Link>
                )}
              </div>
              <details className="mt-6">
                <summary className="min-h-11 cursor-pointer text-sm font-medium text-text-muted">Set the window by hand</summary>
                <div className="mt-4">
                  <AdminForm action={openCheckIn.bind(null, event.id)} submitLabel="Save window">
                    <TextField name="opensAt" label="Opens" type="datetime-local" defaultValue={dateToAccraInput(window.opensAt)} help="Ghana time." />
                    <TextField name="closesAt" label="Closes" type="datetime-local" defaultValue={dateToAccraInput(window.closesAt)} help="Ghana time." />
                  </AdminForm>
                </div>
              </details>
            </>
          )}
        </section>

        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Add someone</h2>
          <p className="mt-1 text-sm text-text-muted">For members without a phone or data. Works after check-in closes. They must have signed in to the portal once.</p>
          <div className="mt-4">
            <AdminForm action={addAttendee.bind(null, event.id)} submitLabel="Add to attendance">
              <TextField name="who" label="Handle or email" />
            </AdminForm>
          </div>
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Checked in <span className="font-display text-text-muted">({event.checkIns.length})</span>
          </h2>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>Public attendance figure: {event.attendance ?? 'not set'}</span>
            {event.checkIns.length > 0 && event.attendance !== event.checkIns.length && <ToggleButton action={useCheckInCount.bind(null, event.id)} label="Use the check-in count" />}
          </div>
        </div>
        {event.checkIns.length === 0 ? (
          <p className="text-text-muted">Nobody has checked in yet.</p>
        ) : (
          <TableWrap>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Member</th>
                  <th className={TH}>Time</th>
                  <th className={TH}>How</th>
                  <th className={TH}>Change</th>
                </tr>
              </thead>
              <tbody>
                {event.checkIns.map((c) => (
                  <tr key={c.id}>
                    <td className={TD}>
                      <Link href={`/admin/members/${c.userId}`} className={LINK}>
                        {c.user.profile?.displayName ?? c.user.email}
                      </Link>
                      <span className="block font-display text-xs text-text-muted">@{c.user.profile?.handle}</span>
                    </td>
                    <td className={`${TD} font-display text-xs`}>{formatTime(c.createdAt)}</td>
                    <td className={TD}>{c.method === 'EDITOR' ? `Added by ${c.recordedBy}` : 'Code'}</td>
                    <td className={TD}>
                      <ToggleButton action={removeAttendee.bind(null, event.id, c.userId)} label="Remove" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </section>
    </>
  );
}
