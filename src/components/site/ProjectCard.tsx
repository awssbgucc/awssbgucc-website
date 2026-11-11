import Image from 'next/image';
import Link from 'next/link';

export type ProjectCardData = {
  slug: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  stack: string[];
  repoUrl?: string | null;
  demoUrl?: string | null;
};

/** A project always shows its image: approval needs one. */
export function ProjectCard({ project, credit, size = 'normal' }: { project: ProjectCardData; credit?: string | null; size?: 'normal' | 'large' }) {
  return (
    <article className={`project-card ${size === 'large' ? 'project-card-large' : ''}`}>
      <div className="project-shot">
        {project.imageUrl && (
          <Image src={project.imageUrl} alt="" fill sizes={size === 'large' ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'} />
        )}
        <span className="project-corner" aria-hidden="true" />
      </div>
      <div className="project-body">
        {project.stack.length > 0 && (
          <ul className="chip-row" aria-label="Built with">
            {project.stack.slice(0, 4).map((name) => <li key={name}>{name}</li>)}
          </ul>
        )}
        <h3>
          <Link href={`/projects/${project.slug}`} className="stretched">{project.title}</Link>
        </h3>
        <p className="project-summary">{project.summary}</p>
        <p className="project-meta">
          {credit && <span>By {credit}</span>}
          {project.demoUrl && <span>Live</span>}
          {project.repoUrl && <span>Source</span>}
        </p>
      </div>
    </article>
  );
}

/** What a member project needs, shown where approved projects will appear. Never a stand-in project. */
export function ProjectSlots() {
  const slots = ['A screenshot or architecture diagram', 'What it does and the AWS services behind it', 'The code, a live link and who built it'];
  return (
    <ol className="project-slots" data-reveal="steps">
      {slots.map((text, index) => (
        <li key={text} style={{ '--i': index } as React.CSSProperties}>
          <span className="type-label">{String(index + 1).padStart(2, '0')}</span>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  );
}
