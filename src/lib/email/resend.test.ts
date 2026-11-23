import { describe, expect, it, vi } from 'vitest';
import { contactSchema, isContactTopic } from '@/lib/validation/contact';
import { buildCampaignEmail, buildWelcomeEmail, markdownToEmailHtml, sendNewsletterEmail } from './newsletter';
import { buildContactEmail, escapeHtml, sendContactEmail } from './resend';

const VALID = {
  topic: 'partnership' as const,
  name: 'Ama Mensah',
  email: 'AMA@ucc.edu.gh',
  organisation: 'CITSA',
  subject: 'Joint cloud workshop',
  message: 'We would like to co-host an introductory AWS session for our department next month.',
  website: '',
};

describe('contactSchema', () => {
  it('accepts valid contact submissions and normalises email', () => {
    const parsed = contactSchema.safeParse(VALID);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe('ama@ucc.edu.gh');
      expect(parsed.data.organisation).toBe('CITSA');
    }
  });

  it('rejects short messages and invalid emails', () => {
    const parsed = contactSchema.safeParse({ ...VALID, email: 'not-an-email', message: 'Hi' });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.issues.map((i) => i.path[0]);
      expect(fields).toContain('email');
      expect(fields).toContain('message');
    }
  });

  it('recognises known contact topics', () => {
    expect(isContactTopic('partnership')).toBe(true);
    expect(isContactTopic('unknown')).toBe(false);
    expect(isContactTopic(null)).toBe(false);
  });
});

describe('resend email helper', () => {
  it('escapes HTML characters in user input', () => {
    expect(escapeHtml('<script>"alert"&\'1\'</script>')).toBe('&lt;script&gt;&quot;alert&quot;&amp;&#39;1&#39;&lt;/script&gt;');
  });

  it('builds a reply-to Resend payload with escaped HTML', () => {
    const parsed = contactSchema.parse({ ...VALID, message: 'Hello <b>team</b> & friends.' });
    const email = buildContactEmail(parsed, 'awssbgucc@gmail.com', 'AWS SBG UCC <contact@example.com>');
    expect(email.to).toEqual(['awssbgucc@gmail.com']);
    expect(email.reply_to).toBe('ama@ucc.edu.gh');
    expect(email.from).toBe('AWS SBG UCC <contact@example.com>');
    expect(email.subject).toBe('[AWS SBG UCC: Partnership] Joint cloud workshop');
    expect(email.html).toContain('Hello &lt;b&gt;team&lt;/b&gt; &amp; friends.');
    expect(email.text).toContain('Organisation: CITSA');
  });

  it('returns NOT_CONFIGURED when no API key is set', async () => {
    const parsed = contactSchema.parse(VALID);
    const result = await sendContactEmail(parsed, 'awssbgucc@gmail.com', { apiKey: '' });
    expect(result).toEqual({ ok: false, code: 'NOT_CONFIGURED' });
  });

  it('posts to the Resend API when configured', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 're_123' }), { status: 200 }));
    const parsed = contactSchema.parse(VALID);
    const result = await sendContactEmail(parsed, 'awssbgucc@gmail.com', {
      apiKey: 're_test_key',
      from: 'AWS SBG UCC <contact@example.com>',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result).toEqual({ ok: true, id: 're_123' });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer re_test_key');
  });
});

describe('newsletter email helpers', () => {
  it('escapes raw HTML in Markdown and renders headings, lists, bold and links', () => {
    const html = markdownToEmailHtml('# Welcome <script>bad()</script>\n\nRead **more** at [our site](https://example.com).\n\n- First item\n- Second item');
    expect(html).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(html).toContain('<strong');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('<ul');
    expect(html).toContain('First item');
  });

  it('builds welcome and campaign emails with List-Unsubscribe headers', () => {
    const welcome = buildWelcomeEmail({
      email: 'student@ucc.edu.gh',
      name: 'Ama',
      unsubscribeUrl: 'https://example.com/newsletter/unsubscribe?token=abc',
      siteUrl: 'https://example.com',
      from: 'AWS SBG UCC <news@example.com>',
    });
    expect(welcome.to).toEqual(['student@ucc.edu.gh']);
    expect(welcome.headers?.['List-Unsubscribe']).toBe('<https://example.com/newsletter/unsubscribe?token=abc>');
    expect(welcome.html).toContain('Hi Ama,');

    const campaign = buildCampaignEmail({
      email: 'student@ucc.edu.gh',
      subscriberName: 'Ama',
      subject: 'Next Saturday session',
      previewText: 'Bring your laptop.',
      body: 'Join us in LT5 at 4:30 PM.',
      unsubscribeUrl: 'https://example.com/newsletter/unsubscribe?token=abc',
      siteUrl: 'https://example.com',
      from: 'AWS SBG UCC <news@example.com>',
    });
    expect(campaign.subject).toBe('Next Saturday session');
    expect(campaign.html).toContain('Bring your laptop.');
    expect(campaign.text).toContain('Unsubscribe: https://example.com/newsletter/unsubscribe?token=abc');
  });

  it('handles missing key and successful Resend sends', async () => {
    const payload = buildWelcomeEmail({
      email: 'student@ucc.edu.gh',
      unsubscribeUrl: 'https://example.com/newsletter/unsubscribe?token=abc',
      siteUrl: 'https://example.com',
    });
    expect(await sendNewsletterEmail(payload, { apiKey: '' })).toEqual({ ok: false, code: 'NOT_CONFIGURED' });

    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'news_1' }), { status: 200 }));
    const res = await sendNewsletterEmail(payload, {
      apiKey: 're_test_key',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(res).toEqual({ ok: true, id: 'news_1' });
  });
});
