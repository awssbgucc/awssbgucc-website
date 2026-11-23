import { escapeHtml, type SendResult } from './resend';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'AWS SBG UCC <onboarding@resend.dev>';

export function isResendConfigured(apiKey = process.env.RESEND_API_KEY) {
  return !!apiKey?.trim();
}

function formatInlineMarkdown(escapedLine: string) {
  let html = escapedLine.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, label: string, url: string) =>
      `<a href="${url}" style="color:#00683f;text-decoration:underline;text-underline-offset:3px;">${label}</a>`,
  );
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#161d26;font-weight:600;">$1</strong>');
  return html;
}

/** Converts basic campaign Markdown (headings, paragraphs, lists, bold, links) to safe inline-styled email HTML. */
export function markdownToEmailHtml(markdown: string) {
  const normalised = markdown.replace(/\r\n/g, '\n').trim();
  if (!normalised) return '';

  const blocks = normalised.split(/\n{2,}/);
  const parts: string[] = [];

  for (const rawBlock of blocks) {
    const lines = rawBlock.split('\n').map((line) => line.trimRight());
    const escapedLines = lines.map((line) => escapeHtml(line));

    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      const items = escapedLines
        .map((line) => line.replace(/^\s*[-*]\s+/, ''))
        .map((line) => `<li style="margin:6px 0;">${formatInlineMarkdown(line)}</li>`)
        .join('');
      parts.push(`<ul style="margin:0 0 16px;padding-left:20px;color:#1f2731;font-size:15px;line-height:1.65;">${items}</ul>`);
      continue;
    }

    const first = lines[0].trim();
    if (first.startsWith('## ')) {
      parts.push(
        `<h2 style="margin:22px 0 10px;font-size:19px;line-height:1.3;color:#161d26;">${formatInlineMarkdown(escapeHtml(first.slice(3).trim()))}</h2>`,
      );
      if (lines.length > 1) {
        const rest = escapedLines.slice(1).map(formatInlineMarkdown).join('<br />');
        parts.push(`<p style="margin:0 0 16px;color:#1f2731;font-size:15px;line-height:1.65;">${rest}</p>`);
      }
      continue;
    }

    if (first.startsWith('# ')) {
      parts.push(
        `<h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#161d26;">${formatInlineMarkdown(escapeHtml(first.slice(2).trim()))}</h1>`,
      );
      if (lines.length > 1) {
        const rest = escapedLines.slice(1).map(formatInlineMarkdown).join('<br />');
        parts.push(`<p style="margin:0 0 16px;color:#1f2731;font-size:15px;line-height:1.65;">${rest}</p>`);
      }
      continue;
    }

    const bodyHtml = escapedLines.map(formatInlineMarkdown).join('<br />');
    parts.push(`<p style="margin:0 0 16px;color:#1f2731;font-size:15px;line-height:1.65;">${bodyHtml}</p>`);
  }

  return parts.join('');
}

function wrapEmailLayout({
  eyebrow,
  heading,
  previewText,
  contentHtml,
  unsubscribeUrl,
  siteUrl,
}: {
  eyebrow: string;
  heading: string;
  previewText?: string | null;
  contentHtml: string;
  unsubscribeUrl: string;
  siteUrl: string;
}) {
  const hiddenPreview = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(previewText)}</div>`
    : '';
  return [
    hiddenPreview,
    '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#161d26;background:#ffffff;border:1px solid #d1d5db;">',
    '<div style="height:4px;background:linear-gradient(90deg,#ad5cff 0 25%,#42b4ff 25% 50%,#ff57e9 50% 75%,#00e582 75%);"></div>',
    '<div style="padding:28px 24px;">',
    `<p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#525c69;">${escapeHtml(eyebrow)}</p>`,
    `<h1 style="margin:0 0 20px;font-size:22px;line-height:1.25;color:#161d26;">${escapeHtml(heading)}</h1>`,
    contentHtml,
    '<hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />',
    '<p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#525c69;">',
    'AWS Student Builder Group at University of Cape Coast. ',
    `<a href="${escapeHtml(siteUrl)}" style="color:#525c69;text-decoration:underline;">Visit website</a> &middot; `,
    `<a href="${escapeHtml(unsubscribeUrl)}" style="color:#525c69;text-decoration:underline;">Unsubscribe</a>`,
    '</p>',
    '</div>',
    '</div>',
  ].join('');
}

export type NewsletterEmailPayload = {
  from: string;
  to: string[];
  reply_to?: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
};

export function buildWelcomeEmail({
  email,
  name,
  unsubscribeUrl,
  siteUrl,
  from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
  replyTo,
}: {
  email: string;
  name?: string | null;
  unsubscribeUrl: string;
  siteUrl: string;
  from?: string;
  replyTo?: string;
}): NewsletterEmailPayload {
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const subject = 'You are subscribed to AWS SBG UCC updates';
  const text = [
    greeting,
    '',
    'Thanks for subscribing to the AWS Student Builder Group at University of Cape Coast newsletter.',
    'We will send updates about upcoming campus sessions, bootcamps, recaps and community announcements.',
    '',
    `Explore upcoming events: ${siteUrl}/events`,
    `Unsubscribe at any time: ${unsubscribeUrl}`,
  ].join('\n');

  const contentHtml = [
    `<p style="margin:0 0 16px;color:#1f2731;font-size:15px;line-height:1.65;">${escapeHtml(greeting)}</p>`,
    '<p style="margin:0 0 16px;color:#1f2731;font-size:15px;line-height:1.65;">Thanks for subscribing to updates from the AWS Student Builder Group at University of Cape Coast. You will hear from us when we announce new campus talks, build sessions, bootcamps and community recaps.</p>',
    `<p style="margin:20px 0 0;"><a href="${escapeHtml(`${siteUrl}/events`)}" style="display:inline-block;padding:10px 18px;background:#00e582;color:#161d26;font-size:14px;font-weight:600;text-decoration:none;">See upcoming events</a></p>`,
  ].join('');

  return {
    from,
    to: [email],
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject,
    text,
    html: wrapEmailLayout({
      eyebrow: 'AWS SBG UCC Newsletter',
      heading: 'Welcome to the mailing list',
      previewText: 'Updates on campus sessions, bootcamps and recaps at UCC.',
      contentHtml,
      unsubscribeUrl,
      siteUrl,
    }),
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
  };
}

export function buildCampaignEmail({
  email,
  subscriberName,
  subject,
  previewText,
  body,
  unsubscribeUrl,
  siteUrl,
  from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
  replyTo,
}: {
  email: string;
  subscriberName?: string | null;
  subject: string;
  previewText?: string | null;
  body: string;
  unsubscribeUrl: string;
  siteUrl: string;
  from?: string;
  replyTo?: string;
}): NewsletterEmailPayload {
  const greeting = subscriberName ? `Hi ${subscriberName},\n\n` : '';
  const text = `${greeting}${body.trim()}\n\nUnsubscribe: ${unsubscribeUrl}`;
  const greetingHtml = subscriberName
    ? `<p style="margin:0 0 16px;color:#1f2731;font-size:15px;line-height:1.65;">Hi ${escapeHtml(subscriberName)},</p>`
    : '';

  return {
    from,
    to: [email],
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject,
    text,
    html: wrapEmailLayout({
      eyebrow: 'AWS SBG UCC Update',
      heading: subject,
      previewText,
      contentHtml: `${greetingHtml}${markdownToEmailHtml(body)}`,
      unsubscribeUrl,
      siteUrl,
    }),
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
  };
}

export async function sendNewsletterEmail(
  payload: NewsletterEmailPayload,
  options: { apiKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<SendResult> {
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, code: 'NOT_CONFIGURED' };

  const fetcher = options.fetchImpl ?? fetch;
  const response = await fetcher(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    return { ok: false, code: 'DELIVERY_FAILED', status: response.status, detail };
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id ?? 'sent' };
}
