import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, LINK, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Projects' };

type Props = { searchParams: Promise<{ status?: string }> };
const STATUSES = ['PENDING', 'APPROVED', 'DRAFT', 'REJECTED'] as const;

export default async function AdminProjectsPage({ searchParams }: Props) {
  await requireRole();
  const params = await searchParams;
  const status = STATUSES.find((s) => s === params.status) ?? 'PENDING';
  const projects = await db.project.findMany({
    where: { status },
    orderBy: { updatedAt: 'desc' },
    include: { owner: { select: { profile: { select: { displayName: true } } } } },
  });
  return (
    <>
      <PageHeader title="Projects" action={{ href: '/admin/projects/new', label: 'Add a curated project' }} />
      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/projects?status=${s}`} aria-current={s === status ? 'page' : undefined} className={`min-h-10 rounded-full border px-3.5 py-2 text-sm font-medium ${s === status ? 'border-white' : 'border-border-strong'}`}>
            <StatusBadge status={s} />
          </Link>
        ))}
      </nav>
      {projects.length === 0 ? (
        <Empty>None.</Empty>
      ) : (
        <TableWrap>
          <table className={TABLE}>
            <thead>
              <tr>
                <th className={TH}>Project</th>
                <th className={TH}>By</th>
                <th className={TH}>Updated</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className={TD}>
                    <Link href={`/admin/projects/${p.id}`} className={LINK}>
                      {p.title}
                    </Link>{' '}
                    {p.featured && <Badge tone="lime">Featured</Badge>}
                  </td>
                  <td className={TD}>{p.owner?.profile?.displayName ?? p.credits ?? 'Curated'}</td>
                  <td className={`${TD} font-display text-xs`}>{formatDate(p.updatedAt)}</td>
                  <td className={TD}>
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
