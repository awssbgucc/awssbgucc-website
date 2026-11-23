'use client';

import { ArrowRight, Check, Copy, Mail } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { CONTACT_TOPICS, isContactTopic, topicLabel, type ContactTopic } from '@/lib/validation/contact';

type ApiResponse = {
  ok: boolean;
  code?: 'NOT_CONFIGURED' | 'DELIVERY_FAILED';
  message?: string;
  errors?: Record<string, string>;
};

const MAX_MESSAGE = 2000;

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className="contact-copy-btn" aria-label={`Copy ${email}`}>
      {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export function ContactForm({ fallbackEmail }: { fallbackEmail: string }) {
  const [topic, setTopic] = useState<ContactTopic>('partnership');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState<{ message: string; showMailto: boolean } | null>(null);
  const [sentTo, setSentTo] = useState('');

  // Support deep links like /contact?topic=partnership while keeping /contact static.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('topic');
    if (isContactTopic(param)) setTopic(param);
  }, []);

  const orgPlaceholder =
    topic === 'partnership'
      ? 'Company, organisation, student association or department'
      : topic === 'sponsorship'
        ? 'Company or organisation name'
        : 'Company, club or department (optional)';

  const subjectPlaceholder =
    topic === 'partnership'
      ? 'For example, Co-hosting a cloud workshop or partnering on a bootcamp'
      : topic === 'speaking'
        ? 'For example, Guest talk on cloud security or DevOps'
        : topic === 'sponsorship'
          ? 'For example, Supporting a campus build session'
          : 'Short summary of your message (optional)';

  const mailtoHref = (() => {
    const mailSubject = subject.trim() ? `[${topicLabel(topic)}] ${subject.trim()}` : `[${topicLabel(topic)}] Message from ${name.trim() || 'website visitor'}`;
    const bodyLines = [
      `Topic: ${topicLabel(topic)}`,
      name.trim() ? `Name: ${name.trim()}` : null,
      organisation.trim() ? `Organisation: ${organisation.trim()}` : null,
      '',
      message.trim(),
    ].filter((line): line is string => line !== null);
    return `mailto:${fallbackEmail}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
  })();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setServerError(null);
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, name, email, organisation, subject, message, website }),
      });
      const data = (await response.json().catch(() => ({ ok: false }))) as ApiResponse;

      if (response.ok && data.ok) {
        setSentTo(email.trim());
        setStatus('sent');
        return;
      }

      if (data.errors) setErrors(data.errors);
      setServerError({
        message: data.message ?? 'Could not send your message. Please check your details and try again.',
        showMailto: data.code === 'NOT_CONFIGURED' || data.code === 'DELIVERY_FAILED' || response.status >= 500,
      });
      setStatus('error');
    } catch {
      setServerError({
        message: 'Could not reach the server. Check your connection and try again, or email us directly.',
        showMailto: true,
      });
      setStatus('error');
    }
  }

  function reset() {
    setName('');
    setEmail('');
    setOrganisation('');
    setSubject('');
    setMessage('');
    setWebsite('');
    setErrors({});
    setServerError(null);
    setStatus('idle');
  }

  return (
    <div className="contact-panel">
      <div className="contact-panel-steps" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      {status === 'sent' ? (
        <div role="status" className="contact-sent">
          <div className="flex items-center gap-3">
            <span className="checkin-cell" aria-hidden="true" />
            <p className="type-label text-lime">Message sent</p>
          </div>
          <h2 className="section-title mt-4">Thanks for reaching out</h2>
          <p className="mt-4 max-w-[50ch] text-text-muted">
            Your message has been delivered to the core team inbox. We will reply to <span className="font-medium text-text-strong">{sentTo}</span> as soon as we can.
          </p>
          <div className="mt-8">
            <button type="button" onClick={reset} className="cta cta-line">
              Send another message
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="contact-form">
          <div className="contact-form-head">
            <p className="type-label text-lime">Send a message</p>
            <h2 className="contact-form-title">Write to the core team</h2>
            <p className="text-sm text-text-muted">
              Choose a topic below and tell us what you have in mind. Messages go straight to the core team inbox.
            </p>
          </div>

          <fieldset className="contact-fieldset">
            <legend className="type-label text-text-muted">Topic</legend>
            <div className="contact-topics">
              {CONTACT_TOPICS.map((item) => {
                const selected = topic === item.value;
                return (
                  <label key={item.value} className={`contact-topic ${selected ? 'is-selected' : ''}`}>
                    <input
                      type="radio"
                      name="topic"
                      value={item.value}
                      checked={selected}
                      onChange={() => setTopic(item.value)}
                      className="sr-only"
                    />
                    <span className="contact-topic-top">
                      <span className={`swatch swatch-${item.tone}`} aria-hidden="true" />
                      <span className="contact-topic-label">{item.label}</span>
                    </span>
                    <span className="contact-topic-note">{item.note}</span>
                  </label>
                );
              })}
            </div>
            {errors.topic && (
              <p className="contact-error" role="alert">
                {errors.topic}
              </p>
            )}
          </fieldset>

          <div className="contact-row">
            <div className="contact-field">
              <label htmlFor="contact-name" className="type-label">
                Your name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
                className="contact-input"
              />
              {errors.name && (
                <p id="contact-name-error" className="contact-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email" className="type-label">
                Email address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={160}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                className="contact-input"
              />
              {errors.email && (
                <p id="contact-email-error" className="contact-error">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="contact-row">
            <div className="contact-field">
              <label htmlFor="contact-org" className="type-label">
                Company, club or department <span className="contact-opt">(optional)</span>
              </label>
              <input
                id="contact-org"
                name="organisation"
                type="text"
                autoComplete="organization"
                maxLength={120}
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                placeholder={orgPlaceholder}
                aria-invalid={!!errors.organisation}
                aria-describedby={errors.organisation ? 'contact-org-error' : undefined}
                className="contact-input"
              />
              {errors.organisation && (
                <p id="contact-org-error" className="contact-error">
                  {errors.organisation}
                </p>
              )}
            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject" className="type-label">
                Subject <span className="contact-opt">(optional)</span>
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                maxLength={140}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={subjectPlaceholder}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                className="contact-input"
              />
              {errors.subject && (
                <p id="contact-subject-error" className="contact-error">
                  {errors.subject}
                </p>
              )}
            </div>
          </div>

          <div className="contact-field">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="contact-message" className="type-label">
                Message
              </label>
              <span className="font-display text-xs text-text-muted">
                {message.length} / {MAX_MESSAGE}
              </span>
            </div>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={6}
              maxLength={MAX_MESSAGE}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your company, organisation or question, along with any preferred dates or details."
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'contact-message-error' : undefined}
              className="contact-input contact-textarea"
            />
            {errors.message && (
              <p id="contact-message-error" className="contact-error">
                {errors.message}
              </p>
            )}
          </div>

          {/* Hidden spam trap for automated bots. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="contact-website">Leave this blank</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          {serverError && (
            <div role="alert" className="contact-alert">
              <p>{serverError.message}</p>
              {serverError.showMailto && (
                <a href={mailtoHref} className="contact-alert-link">
                  <Mail size={16} aria-hidden />
                  Open this message in your email app
                </a>
              )}
            </div>
          )}

          <div className="contact-submit-row">
            <button type="submit" disabled={status === 'sending'} className="cta cta-mint disabled:cursor-not-allowed disabled:opacity-60">
              <span>{status === 'sending' ? 'Sending message' : 'Send message'}</span>
              <ArrowRight size={17} className="cta-arrow-icon" aria-hidden />
            </button>
            <p className="text-xs text-text-muted">We reply to the email address you enter above.</p>
          </div>
        </form>
      )}
    </div>
  );
}
