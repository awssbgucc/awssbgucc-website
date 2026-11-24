export type HeadingItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type PostCategory = {
  key: 'event' | 'bootcamp' | 'notes' | 'external';
  label: string;
  tone: 'blue' | 'purple' | 'mint' | 'magenta';
};

/** Returns a slug generator that appends numeric suffixes when headings repeat. */
export function createHeadingSlugger() {
  const counts = new Map<string, number>();
  return (text: string) => {
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s-]+/g, '-') || 'section';
    const next = (counts.get(base) ?? 0) + 1;
    counts.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  };
}

/** Strips common inline Markdown syntax from a heading or line of text. */
export function stripMarkdownInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\s+#+\s*$/, '')
    .trim();
}

/** Extracts level 2 and level 3 Markdown headings outside fenced code blocks. */
export function extractHeadings(markdown: string | null | undefined): HeadingItem[] {
  if (!markdown) return [];
  const slug = createHeadingSlugger();
  const headings: HeadingItem[] = [];
  let fence: '`' | '~' | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      fence = fence === '`' ? null : fence === null ? '`' : fence;
      continue;
    }
    if (trimmed.startsWith('~~~')) {
      fence = fence === '~' ? null : fence === null ? '~' : fence;
      continue;
    }
    if (fence) continue;

    const match = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    const text = stripMarkdownInline(match[2]);
    if (!text) continue;
    headings.push({
      id: slug(text),
      text,
      level: match[1].length as 2 | 3,
    });
  }

  return headings;
}

/** Counts readable words in Markdown while ignoring syntax tokens and link targets. */
export function countWords(markdown: string | null | undefined): number {
  if (!markdown) return 0;
  const cleaned = markdown
    .replace(/```[^\r\n]*\r?\n([\s\S]*?)```/g, ' $1 ')
    .replace(/~~~[^\r\n]*\r?\n([\s\S]*?)~~~/g, ' $1 ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, ' $1 ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}(?:>|\*|-|\+|\d+\.)\s+/gm, '')
    .replace(/[*_`~]/g, ' ')
    .trim();

  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

/** Estimates reading time at 200 words per minute. */
export function estimateReadingTime(markdown: string | null | undefined): {
  words: number;
  minutes: number;
  label: string;
} {
  const words = countWords(markdown);
  if (words === 0) return { words: 0, minutes: 0, label: '' };
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, minutes, label: `${minutes} min read` };
}

/** Assigns a display category and SBG palette tone to a post. */
export function postCategory(
  post: { externalUrl?: string | null; title: string; excerpt: string },
  hasRelatedEvent: boolean,
): PostCategory {
  if (post.externalUrl) return { key: 'external', label: 'External', tone: 'magenta' };
  if (hasRelatedEvent) return { key: 'event', label: 'Event recap', tone: 'blue' };
  if (/bootcamp/i.test(`${post.title} ${post.excerpt}`)) {
    return { key: 'bootcamp', label: 'Bootcamp notes', tone: 'purple' };
  }
  return { key: 'notes', label: 'Community notes', tone: 'mint' };
}
