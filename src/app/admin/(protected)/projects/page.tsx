import type { Metadata } from 'next';
import Link from 'next/link';
import { Empty, FilterPills, LINK, PageHeader, TABLE, TableWrap, TD, TH } from '@/components/admin/ui';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Projects' };

type Props = { searchParams: Promise<{ status?: string }> };
const STATUSES = [
  { key: 'PENDING', label: 'In review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'REJECTED', label: 'Not accepted' },
] as const;

export default async function AdminProjectsPage({ searchParams }: Props) {
  await requireRole();
  const params = await searchParams;
  const status = STATUSES.find((s) => s.key === params.status)?.key ?? 'PENDING';
  const [projects, counts] = await Promise.all([
    db.project.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
      include: { owner: { select: { profile: { select: { displayName: true } } } } },
    }),
    db.project.groupBy({ by: ['status'], _count: true }),
  ]);
  const countMap = new Map(counts.map((c) => [c.status, c._count]));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Approve member builds or add curated projects to the public gallery."
        action={{ href: '/admin/projects/new', label: 'Add a curated project' }}
      />
      <FilterPills
        label="Filter by status"
        items={STATUSES.map(({ key, label }) => ({
          label,
          href: `/admin/projects?status=${key}`,
          active: key === status,
          count: countMap.get(key) ?? 0,
        }))}
      />
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
                  <td className={`${TD} font-display text-xs whitespace-nowrap`}>{formatDate(p.updatedAt)}</td>
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
