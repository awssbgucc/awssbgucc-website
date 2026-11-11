import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProfileCard } from '@/components/builder/ProfileCard';
import { ProjectCard } from '@/components/site/ProjectCard';
import { Badge } from '@/components/ui/Badge';
import { ParticipationGrid } from '@/components/ui/ParticipationGrid';
import { Section } from '@/components/ui/Section';
import { Stat } from '@/components/ui/Stat';
import { getPublicProfile } from '@/lib/content/queries';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/format';
import { memberRecord } from '@/lib/platform/member-data';

type Props = { params: Promise<{ handle: string }> };

// Rendered on every request, so switching a profile to private takes effect at once.
export const dynamic = 'force-dynamic';

// A member's own page, only when they chose a public profile. Search engines list it only if they also allowed that.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile((await params).handle);
  if (!profile) return { robots: { index: false } };
  return { title: profile.displayName, robots: { index: profile.allowIndexing, follow: profile.allowIndexing } };
}

export default async function BuilderProfilePage({ params }: Props) {
  const profile = await getPublicProfile((await params).handle);
  if (!profile) notFound();
  const [record, achievements, projects] = await Promise.all([
    memberRecord(profile.userId),
    db.memberAchievement.findMany({ where: { userId: profile.userId }, orderBy: { awardedAt: 'desc' }, include: { achievement: true } }),
    db.project.findMany({ where: { ownerId: profile.userId, status: 'APPROVED' }, orderBy: { reviewedAt: 'desc' } }),
  ]);

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ProfileCard profile={profile} level={record.level.level} nameIsHeading />
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            {profile.githubUrl && (
              <a href={profile.githubUrl} className="inline-flex min-h-11 items-center underline underline-offset-4">
                GitHub
              </a>
            )}
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} className="inline-flex min-h-11 items-center underline underline-offset-4">
                LinkedIn
              </a>
            )}
          </div>
          {profile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <Badge key={i}>{i}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-10 lg:col-span-7">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat value={record.counts.sessions} label="Sessions" />
            <Stat value={record.counts.approvedSubmissions} label="Approved builds" />
            <Stat value={record.counts.approvedProjects} label="Projects" />
            <Stat value={record.xp} label="XP" />
          </div>
          {record.sessions.length > 0 && <ParticipationGrid sessions={record.sessions} attended={record.attended} />}
          <section aria-labelledby="achievements">
            <h2 id="achievements" className="type-label text-text-muted">
              Achievements
            </h2>
            {achievements.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">None yet.</p>
            ) : (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {achievements.map(({ achievement, awardedAt }) => (
                  <li key={achievement.id} className="rounded-md border border-lime/40 p-4">
                    <p className="font-semibold text-white">{achievement.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{achievement.description}</p>
                    <p className="type-label mt-2 text-text-muted">{formatDate(awardedAt)}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-text-muted">Achievements are records of the AWS Student Builder Group at University of Cape Coast. They are not AWS credentials.</p>
          </section>
        </div>
      </div>
      {projects.length > 0 && (
        <section aria-labelledby="projects" className="mt-16">
          <h2 id="projects" className="type-label mb-4 text-text-muted">
            Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
      <p className="mt-16 text-sm text-text-muted">
        <Link href="/sign-in" className="underline underline-offset-4">
          Members can make their own profile public
        </Link>{' '}
        from the builder portal.
      </p>
    </Section>
  );
}
