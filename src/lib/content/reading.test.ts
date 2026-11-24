import { describe, expect, it } from 'vitest';
import { countWords, createHeadingSlugger, estimateReadingTime, extractHeadings, postCategory, stripMarkdownInline } from './reading';

describe('createHeadingSlugger', () => {
  it('normalizes headings and deduplicates repeats', () => {
    const slug = createHeadingSlugger();
    expect(slug('The conversation')).toBe('the-conversation');
    expect(slug('The conversation')).toBe('the-conversation-2');
    expect(slug('The conversation')).toBe('the-conversation-3');
    expect(slug('AWS & Cloud: Step 1!')).toBe('aws-cloud-step-1');
    expect(slug('...')).toBe('section');
  });
});

describe('stripMarkdownInline', () => {
  it('removes inline Markdown formatting and trailing hashes', () => {
    expect(stripMarkdownInline('**[Amazon S3](https://aws.amazon.com/s3/)** `bucket` ###')).toBe('Amazon S3 bucket');
  });
});

describe('extractHeadings', () => {
  it('returns empty array for empty or null input', () => {
    expect(extractHeadings(null)).toEqual([]);
    expect(extractHeadings(undefined)).toEqual([]);
    expect(extractHeadings('')).toEqual([]);
  });

  it('extracts level 2 and 3 headings, deduplicates, and ignores fenced code blocks', () => {
    const md = [
      '# Top title',
      '## The conversation',
      'Some paragraph.',
      '### Subtopic with [link](/events/x) and `code`',
      '```markdown',
      '## Not a real heading',
      '### Also inside code',
      '```',
      '~~~',
      '## Inside tilde fence',
      '~~~',
      '## The conversation',
    ].join('\n');

    expect(extractHeadings(md)).toEqual([
      { id: 'the-conversation', text: 'The conversation', level: 2 },
      { id: 'subtopic-with-link-and-code', text: 'Subtopic with link and code', level: 3 },
      { id: 'the-conversation-2', text: 'The conversation', level: 2 },
    ]);
  });
});

describe('countWords and estimateReadingTime', () => {
  it('handles empty or null content', () => {
    expect(countWords(null)).toBe(0);
    expect(estimateReadingTime('')).toEqual({ words: 0, minutes: 0, label: '' });
  });

  it('returns 1 min read for short articles and scales at 200 words per minute', () => {
    const shortText = '## Heading\n\nTen simple words written here for a short community note.';
    expect(estimateReadingTime(shortText)).toEqual({ words: 11, minutes: 1, label: '1 min read' });

    const words450 = Array.from({ length: 450 }, (_, i) => `word${i}`).join(' ');
    expect(estimateReadingTime(words450)).toEqual({ words: 450, minutes: 3, label: '3 min read' });
  });

  it('excludes Markdown link URLs from the word count', () => {
    const md = 'Read [the event page](https://example.com/very/long/path/with/many/segments) for details.';
    expect(countWords(md)).toBe(6);
  });
});

describe('postCategory', () => {
  it('categorizes external, event recap, bootcamp, and community notes posts', () => {
    expect(postCategory({ externalUrl: 'https://example.com/post', title: 'X', excerpt: 'Y' }, true)).toEqual({
      key: 'external',
      label: 'External',
      tone: 'magenta',
    });
    expect(postCategory({ externalUrl: null, title: 'Notes', excerpt: 'Summary' }, true)).toEqual({
      key: 'event',
      label: 'Event recap',
      tone: 'blue',
    });
    expect(postCategory({ externalUrl: null, title: 'S3 lab', excerpt: 'Week 3 of the bootcamp' }, false)).toEqual({
      key: 'bootcamp',
      label: 'Bootcamp notes',
      tone: 'purple',
    });
    expect(postCategory({ externalUrl: null, title: 'Community update', excerpt: 'General news' }, false)).toEqual({
      key: 'notes',
      label: 'Community notes',
      tone: 'mint',
    });
  });
});
