import { topicLabel, type ContactPayload } from '@/lib/validation/contact';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'AWS SBG UCC <onboarding@resend.dev>';

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildContactEmail(payload: ContactPayload, to: string, from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM) {
  const category = topicLabel(payload.topic);
  const subjectLine = payload.subject ? `[AWS SBG UCC: ${category}] ${payload.subject}` : `[AWS SBG UCC: ${category}] Message from ${payload.name}`;

  const textLines = [
    `Topic: ${category}`,
    `From: ${payload.name} <${payload.email}>`,
    ...(payload.organisation ? [`Organisation: ${payload.organisation}`] : []),
    ...(payload.subject ? [`Subject: ${payload.subject}`] : []),
    '',
    payload.message,
  ];

  const metaRows = [
    ['Topic', category],
    ['Name', payload.name],
    ['Email', payload.email],
    ...(payload.organisation ? [['Organisation', payload.organisation]] : []),
    ...(payload.subject ? [['Subject', payload.subject]] : []),
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#525c69;font-family:monospace;font-size:12px;text-transform:uppercase;width:130px;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#161d26;font-size:14px;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  const html = [
    '<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#161d26;background:#ffffff;border:1px solid #d1d5db;">',
    '<div style="height:4px;background:linear-gradient(90deg,#ad5cff 0 25%,#42b4ff 25% 50%,#ff57e9 50% 75%,#00e582 75%);"></div>',
    '<div style="padding:24px;">',
    '<p style="margin:0 0 8px;font-family:monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#525c69;">AWS SBG UCC Contact Form</p>',
    `<h1 style="margin:0 0 20px;font-size:20px;line-height:1.3;color:#161d26;">${escapeHtml(payload.subject || category)}</h1>`,
    `<table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;margin-bottom:20px;">${metaRows}</table>`,
    '<div style="padding:16px;background:#f4f2ed;border:1px solid #e5e7eb;white-space:pre-wrap;font-size:15px;line-height:1.6;color:#161d26;">',
    escapeHtml(payload.message),
    '</div>',
    '<p style="margin:20px 0 0;font-size:12px;color:#525c69;">Reply directly to this email to answer the sender.</p>',
    '</div>',
    '</div>',
  ].join('');

  return {
    from,
    to: [to],
    reply_to: payload.email,
    subject: subjectLine,
    text: textLines.join('\n'),
    html,
  };
}

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; code: 'NOT_CONFIGURED' | 'DELIVERY_FAILED'; status?: number; detail?: string };

export async function sendContactEmail(
  payload: ContactPayload,
  to: string,
  options: { apiKey?: string; from?: string; fetchImpl?: typeof fetch } = {},
): Promise<SendResult> {
  const apiKey = options.apiKey ?? process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, code: 'NOT_CONFIGURED' };

  const body = buildContactEmail(payload, to, options.from);
  const fetcher = options.fetchImpl ?? fetch;

  const response = await fetcher(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => '')).slice(0, 300);
    return { ok: false, code: 'DELIVERY_FAILED', status: response.status, detail };
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string };
  return { ok: true, id: data.id ?? 'sent' };
}
