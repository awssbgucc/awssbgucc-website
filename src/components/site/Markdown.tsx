import { isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from '@/components/site/motion/TransitionLink';
import { createHeadingSlugger } from '@/lib/content/reading';

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return '';
}

// react-markdown does not render raw HTML, so post and event bodies cannot inject markup.
export function Markdown({
  children,
  headingAnchors = false,
  className = '',
}: {
  children: string;
  headingAnchors?: boolean;
  className?: string;
}) {
  const slug = createHeadingSlugger();
  return (
    <div className={`prose-site ${className}`.trim()}>
      <ReactMarkdown
        components={{
          h2: ({ children: content }) => (
            <h2 id={headingAnchors ? slug(nodeText(content)) : undefined}>{content}</h2>
          ),
          h3: ({ children: content }) => (
            <h3 id={headingAnchors ? slug(nodeText(content)) : undefined}>{content}</h3>
          ),
          a: ({ href, children: content }) => {
            if (href?.startsWith('/')) return <Link href={href}>{content}</Link>;
            if (href && /^https?:\/\//i.test(href)) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              );
            }
            return <a href={href}>{content}</a>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
