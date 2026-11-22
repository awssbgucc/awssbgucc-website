import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/components/site/motion/TransitionLink';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { ProjectBrowser } from '@/components/site/ProjectBrowser';
import { ProjectSlots } from '@/components/site/ProjectCard';
import { getPosts, getProjects } from '@/lib/content/queries';
import { photo } from '@/lib/content/media';
import { projectCredit } from '@/lib/content/selectors';

export const metadata: Metadata = { title: 'Projects', description: 'Websites, apps and tools built on AWS by members of the AWS Student Builder Group at University of Cape Coast.' };

export default async function ProjectsPage() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const weekThree = posts.find((p) => p.slug === 'first-website-on-amazon-s3' && !p.externalUrl);
  const lab = photo('website-on-screen');
  return (
    <section className="band band-top">
      <Container>
        <PageIntro label="Member showcase" title="Projects" intro="Websites, apps and tools created by members, with source code and the AWS services behind each one.">
          {projects.length > 0 && (
            <dl className="intro-stats">
              <div><dt>Projects</dt><dd>{projects.length}</dd></div>
              <div><dt>Technologies</dt><dd>{new Set(projects.flatMap((p) => p.stack)).size}</dd></div>
            </dl>
          )}
        </PageIntro>
        {projects.length > 0 ? (
          <ProjectBrowser
            projects={projects.map((p) => ({ id: p.id, slug: p.slug, title: p.title, summary: p.summary, imageUrl: p.imageUrl, stack: p.stack, repoUrl: p.repoUrl, demoUrl: p.demoUrl, credit: projectCredit(p)?.name ?? null }))}
          />
        ) : (
          <div className="projects-empty">
            <div className="projects-empty-copy" data-reveal="rise">
              <p className="type-label text-magenta">Share your work</p>
              <h2 className="section-title">Be the first to share a project</h2>
              <p>
                Built something using AWS? Submit it through the Builder Portal, whether you worked on it during a session or independently. Include
                a screenshot or architecture diagram, the AWS services behind it and a link to the code.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Cta href="/builder/projects/new" variant="mint">Submit a project</Cta>
                <Cta href="/events" variant="arrow">Find a build session</Cta>
              </div>
              <p className="type-label mt-8 text-text-muted">What to include</p>
              <ProjectSlots />
            </div>
            {weekThree && (
              <Link href={`/blog/${weekThree.slug}`} className="projects-empty-story" data-reveal="mask">
                <Image src={lab.src} alt={lab.alt} fill sizes="(min-width: 1024px) 36vw, 100vw" style={{ objectPosition: '62% 55%' }} />
                <span className="story-caption">
                  <span className="type-label">Built in a session</span>
                  <strong>In week 3 of the bootcamp, every participant deployed a Hostel Finder website on Amazon S3.</strong>
                  <span>Read the recap</span>
                </span>
              </Link>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
