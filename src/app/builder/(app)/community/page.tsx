import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/builder/ui';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { db } from '@/lib/db';
import { requireMember } from '@/lib/member';
import { INTERESTS } from '@/lib/platform/customise';

export const metadata: Metadata = { title: 'Members and projects' };

type Props = { searchParams: Promise<{ q?: string; interest?: string }> };

export default async function CommunityPage({ searchParams }: Props) {
  await requireMember();
  const { q = '', interest = '' } = await searchParams;
  const query = q.trim().slice(0, 60);
  const chosen = (INTERESTS as readonly string[]).includes(interest) ? interest : '';

  // Only members who chose to be seen by other members, or by everyone. Private profiles never appear.
  const [members, projects] = await Promise.all([
    db.memberProfile.findMany({
      where: {
        status: 'ACTIVE',
        onboardedAt: { not: null },
        visibility: { in: ['MEMBERS', 'PUBLIC'] },
        ...(chosen ? { interests: { has: chosen } } : {}),
        ...(query ? { OR: [{ displayName: { contains: query, mode: 'insensitive' } }, { handle: { contains: query, mode: 'insensitive' } }] } : {}),
      },
      orderBy: { displayName: 'asc' },
      take: 60,
    }),
    db.project.findMany({
      where: { status: 'APPROVED', ...(query ? { OR: [{ title: { contains: query, mode: 'insensitive' } }, { stack: { has: query } }] } : {}) },
      orderBy: { reviewedAt: 'desc' },
      take: 12,
    }),
  ]);

  return (
    <>
      <PageTitle label="Community" title="Members and projects" intro="Members who chose to be visible, and every approved project. Change your own visibility on your profile." />

      <form role="search" className="mb-8 flex flex-col gap-3 sm:flex-row" action="/builder/community">
        <label htmlFor="q" className="sr-only">
          Search members and projects
        </label>
        <input id="q" name="q" defaultValue={query} placeholder="Search by name, handle or technology" className="min-h-11 flex-1 rounded-sm border border-border-strong bg-bg px-3 text-base" />
        <label htmlFor="interest" className="sr-only">
          Interest
        </label>
        <select id="interest" name="interest" defaultValue={chosen} className="min-h-11 rounded-sm border border-border-strong bg-bg px-3 text-base">
          <option value="">Any interest</option>
          {INTERESTS.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
        <button type="submit" className="min-h-11 rounded-sm bg-white px-5 text-sm font-medium text-bg hover:bg-white/90">
          Search
        </button>
      </form>

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="type-label mb-4 text-text-muted">
          Members ({members.length})
        </h2>
        {members.length === 0 ? (
          <EmptyState label="No members to show">{query || chosen ? 'Nobody visible matches that search.' : 'No member has made their profile visible yet.'}</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <li key={m.userId} className="flex gap-4 rounded-md border border-border bg-card p-4">
                <Avatar name={m.displayName} accent={m.accentKey} frame={m.frameKey} />
                <div className="min-w-0">
                  {m.visibility === 'PUBLIC' ? (
                    <Link href={`/builders/${m.handle}`} className="font-semibold text-white underline-offset-4 hover:underline">
                      {m.displayName}
                    </Link>
                  ) : (
                    <p className="font-semibold text-white">{m.displayName}</p>
                  )}
                  <p className="font-display text-xs text-text-muted">@{m.handle}</p>
                  {m.programme && <p className="mt-1 text-sm text-text-muted">{m.programme}</p>}
                  {m.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.interests.slice(0, 3).map((i) => (
                        <Badge key={i}>{i}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="projects-heading" className="mt-12">
        <h2 id="projects-heading" className="type-label mb-4 text-text-muted">
          Approved projects
        </h2>
        {projects.length === 0 ? (
          <EmptyState label="No projects yet">Approved projects appear here and on the public projects page.</EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.slug}`} className="block h-full rounded-md border border-border bg-card p-4 transition-colors duration-150 ease-brand hover:border-border-strong">
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-text-muted">{p.summary}</p>
                  <p className="type-label mt-3 text-text-muted">{p.stack.slice(0, 3).join(' · ')}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
