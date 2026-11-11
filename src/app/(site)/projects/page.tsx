import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Cta } from '@/components/site/Cta';
import { PageIntro } from '@/components/site/PageIntro';
import { ProjectBrowser } from '@/components/site/ProjectBrowser';
import { ProjectSlots } from '@/components/site/ProjectCard';
import { getPosts, getProjects } from '@/lib/content/queries';
import { photo } from '@/lib/content/media';
import { projectCredit } from '@/lib/content/selectors';

export const metadata: Metadata = { title: 'Projects', description: 'Projects built on AWS by members of the AWS Student Builder Group at University of Cape Coast.' };

export default async function ProjectsPage() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const weekThree = posts.find((p) => p.slug === 'first-website-on-amazon-s3' && !p.externalUrl);
  const lab = photo('website-on-screen');
  return (
    <section className="band band-top">
      <Container>
        <PageIntro label="Built by members" title="Projects" intro="Apps, sites and tools members have built and deployed. The technical team reviews each one, and builders choose whether they are named.">
          {projects.length > 0 && (
            <dl className="intro-stats">
              <div><dt>Approved projects</dt><dd>{projects.length}</dd></div>
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
              <p className="type-label text-sbg-magenta">The showcase opens with your work</p>
              <h2 className="section-title">No projects are public yet. The first one could be yours.</h2>
              <p>
                Submit a project through the Builder Portal. The technical team reviews it and confirms everyone named has agreed, then it
                appears here with your screenshots, the AWS services you used and links to the code.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Cta href="/builder/projects/new" variant="mint">Share a project</Cta>
                <Cta href="/events" variant="arrow">Find a build session</Cta>
              </div>
              <p className="type-label mt-8 text-text-muted">What a project page shows</p>
              <ProjectSlots />
            </div>
            {weekThree && (
              <Link href={`/blog/${weekThree.slug}`} className="projects-empty-story" data-reveal="mask">
                <Image src={lab.src} alt={lab.alt} fill sizes="(min-width: 1024px) 36vw, 100vw" style={{ objectPosition: '62% 55%' }} />
                <span className="story-caption">
                  <span className="type-label">Built in a session</span>
                  <strong>In week 3 of the bootcamp, the group reports every participant deployed a website on Amazon S3.</strong>
                  <span>Read how it went</span>
                </span>
              </Link>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
