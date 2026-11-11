import { z } from 'zod';
import { optionalHttpsUrl, optionalImageUrl, optionalText, requiredText, resolveSlug, status } from './shared';

export const postSchema = z
  .object({
    title: requiredText('Title'),
    slug: z.string().trim(),
    excerpt: requiredText('Excerpt'),
    author: requiredText('Author'),
    body: optionalText,
    externalUrl: optionalHttpsUrl,
    coverImage: optionalImageUrl,
    status,
  })
  .superRefine((post, ctx) => {
    if (post.status === 'PUBLISHED' && !post.body && !post.externalUrl) {
      ctx.addIssue({ code: 'custom', path: ['body'], message: 'Write the post or add an external link before publishing.' });
    }
  })
  .transform((post) => ({
    ...post,
    slug: resolveSlug(post.slug, post.title),
    // A post lives on the site or links out, never both.
    body: post.externalUrl ? null : post.body,
  }));
