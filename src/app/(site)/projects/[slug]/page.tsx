import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { Markdown } from '@/components/site/Markdown';
import { ProjectCard } from '@/components/site/ProjectCard';
import { getProject, getProjects } from '@/lib/content/queries';
import { projectCredit } from '@/lib/content/selectors';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const credit = projectCredit(project);
  const more = (await getProjects()).filter((p) => p.id !== project.id).slice(0, 2);
  return (
    <section className="band band-top">
      <Container>
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link href="/projects">Projects</Link>
          <span aria-hidden="true">/</span>
          <span>{project.title}</span>
        </nav>
        <header className="project-hero">
          <div>
            <h1 className="event-title">{project.title}</h1>
            <p className="event-summary">{project.summary}</p>
          </div>
          <dl className="project-facts">
            {credit && (
              <div>
                <dt>Built by</dt>
                <dd>{credit.handle ? <Link href={`/builders/${credit.handle}`} className="underline underline-offset-4">{credit.name}</Link> : credit.name}</dd>
              </div>
            )}
            {project.stack.length > 0 && (
              <div>
                <dt>Built with</dt>
                <dd><ul className="chip-row">{project.stack.map((s) => <li key={s}>{s}</li>)}</ul></dd>
              </div>
            )}
            {(project.demoUrl || project.repoUrl) && (
              <div className="project-links">
                {project.demoUrl && <Cta href={project.demoUrl} variant="mint">Open the live project</Cta>}
                {project.repoUrl && <Cta href={project.repoUrl} variant="line">Source code</Cta>}
              </div>
            )}
          </dl>
        </header>
        {project.imageUrl && (
          <div className="project-hero-shot" data-reveal="mask">
            <Image src={project.imageUrl} alt={`${project.title}, screenshot or architecture`} fill priority sizes="(min-width: 1280px) 1280px, 100vw" />
          </div>
        )}
        {project.body && (
          <div className="project-body-text">
            <Markdown>{project.body}</Markdown>
          </div>
        )}
        {more.length > 0 && (
          <div className="mt-20">
            <p className="type-label mb-6 text-text-muted">More from members</p>
            <div className="project-grid">{more.map((p) => <ProjectCard key={p.id} project={p} credit={projectCredit(p)?.name} />)}</div>
          </div>
        )}
      </Container>
    </section>
  );
}
