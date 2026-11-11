import type { Metadata } from 'next';
import { PageTitle } from '@/components/builder/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/db';
import { requireMember } from '@/lib/member';
import { CheckInForm } from './CheckInForm';

export const metadata: Metadata = { title: 'Check in' };

type Props = { searchParams: Promise<{ event?: string; code?: string }> };

export default async function CheckInPage({ searchParams }: Props) {
  await requireMember();
  const { event, code } = await searchParams;
  const now = new Date();
  const open = await db.event.findMany({
    where: { status: 'PUBLISHED', checkInOpensAt: { lte: now }, checkInClosesAt: { gte: now } },
    orderBy: { startsAt: 'asc' },
    select: { slug: true, title: true },
  });
  const chosen = open.find((e) => e.slug === event)?.slug ?? (open.length === 1 ? open[0].slug : '');

  return (
    <>
      <PageTitle label="Check in" title="Check in at a session" intro="Enter the code on the screen, or scan the QR code, while check-in is open. Your attendance goes on your record." />
      {open.length === 0 ? (
        <EmptyState label="Check-in closed">No session has check-in open right now. It opens 30 minutes before a session starts. If you were there and missed it, ask an organiser to add you.</EmptyState>
      ) : (
        <CheckInForm sessions={open} event={chosen} code={code ?? ''} />
      )}
    </>
  );
}
