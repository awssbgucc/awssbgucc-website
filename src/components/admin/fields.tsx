'use client';

import { Bold, Heading2, Heading3, Italic, Link2, List, Quote, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, type ReactNode } from 'react';
import { Markdown } from '@/components/site/Markdown';
import { estimateReadingTime } from '@/lib/content/reading';
import { ACCEPTED_TYPES, uploadError, type UploadFolder } from '@/lib/uploads/rules';
import { useFieldId, useFormState } from './AdminForm';

const INPUT =
  'w-full rounded-md border border-input-border bg-input px-3.5 py-2 text-sm text-text-strong transition-colors placeholder:text-text-faint hover:border-text-muted focus:border-focus focus:outline-none';

type FieldProps = { name: string; label: string; help?: string; defaultValue?: string | number | null };

function Wrapper({ name, label, help, children }: { name: string; label: string; help?: string; children: ReactNode }) {
  const error = useFormState().errors?.[name];
  const id = useFieldId(name);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-strong">
        {label}
      </label>
      {children}
      {help && (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** After a failed save, what was typed wins over the saved value. Help and error text are both announced. */
function useValue({ name, help, defaultValue }: FieldProps) {
  const state = useFormState();
  const id = useFieldId(name);
  const error = !!state.errors?.[name];
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return { id, value: state.values?.[name] ?? String(defaultValue ?? ''), describedBy, invalid: error };
}

export function TextField({ type = 'text', ...props }: FieldProps & { type?: string }) {
  const { id, value, describedBy, invalid } = useValue(props);
  return (
    <Wrapper {...props}>
      {/* The key re-applies the value, because React resets a form after its action runs. */}
      <input key={value} id={id} name={props.name} type={type} defaultValue={value} aria-invalid={invalid} aria-describedby={describedBy} className={`${INPUT} min-h-10`} />
    </Wrapper>
  );
}

export function TextArea({ rows = 3, ...props }: FieldProps & { rows?: number }) {
  const { id, value, describedBy, invalid } = useValue(props);
  return (
    <Wrapper {...props}>
      <textarea key={value} id={id} name={props.name} rows={rows} defaultValue={value} aria-invalid={invalid} aria-describedby={describedBy} className={INPUT} />
    </Wrapper>
  );
}

export function SelectField({ options, ...props }: FieldProps & { options: { value: string; label: string }[] }) {
  const { id, value, describedBy, invalid } = useValue(props);
  return (
    <Wrapper {...props}>
      <select key={value} id={id} name={props.name} defaultValue={value} aria-invalid={invalid} aria-describedby={describedBy} className={`${INPUT} min-h-10`}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({ name, label, help, defaultChecked = false }: { name: string; label: string; help?: string; defaultChecked?: boolean }) {
  const state = useFormState();
  const checked = state.values ? state.values[name] === 'on' : defaultChecked;
  return (
    <div className="rounded-md border border-border bg-bg/60 px-3.5 py-2.5 transition-colors hover:border-border-strong">
      <label className="flex min-h-9 cursor-pointer items-center gap-3 text-sm font-medium text-text-strong">
        <input key={String(checked)} type="checkbox" name={name} defaultChecked={checked} className="size-4 rounded-sm accent-primary" />
        <span>{label}</span>
      </label>
      {help && <p className="mt-1 pl-7 text-xs text-text-muted">{help}</p>}
    </div>
  );
}

export function MarkdownField(props: FieldProps & { rows?: number }) {
  const { id, value: initial, describedBy, invalid } = useValue(props);
  const [draft, setDraft] = useState<string | null>(null);
  const [view, setView] = useState<'write' | 'split' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = draft ?? initial;
  const stats = estimateReadingTime(value);

  function applyFormat(prefix: string, suffix: string, placeholder: string, lineStart = false) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end);
    const body = selected || placeholder;
    const needsNewline = lineStart && start > 0 && value[start - 1] !== '\n' ? '\n' : '';
    const inserted = `${needsNewline}${prefix}${body}${suffix}`;
    const next = value.slice(0, start) + inserted + value.slice(end);
    setDraft(next);
    const cursorStart = start + needsNewline.length + prefix.length;
    const cursorEnd = cursorStart + body.length;
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  const tools = [
    { label: 'Heading 2', icon: Heading2, onClick: () => applyFormat('## ', '', 'Section heading', true) },
    { label: 'Heading 3', icon: Heading3, onClick: () => applyFormat('### ', '', 'Subheading', true) },
    { label: 'Bold', icon: Bold, onClick: () => applyFormat('**', '**', 'bold text') },
    { label: 'Italic', icon: Italic, onClick: () => applyFormat('*', '*', 'emphasized text') },
    { label: 'Quote', icon: Quote, onClick: () => applyFormat('> ', '', 'Quoted line', true) },
    { label: 'Bullet list', icon: List, onClick: () => applyFormat('- ', '', 'List item', true) },
    { label: 'Link', icon: Link2, onClick: () => applyFormat('[', '](https://example.com)', 'link text') },
  ];

  const views: { value: 'write' | 'split' | 'preview'; label: string }[] = [
    { value: 'write', label: 'Write' },
    { value: 'split', label: 'Split' },
    { value: 'preview', label: 'Preview' },
  ];

  return (
    <Wrapper {...props}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-bg p-1.5">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-1">
          {tools.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              disabled={view === 'preview'}
              onClick={onClick}
              className="inline-flex size-8 items-center justify-center rounded-sm border border-transparent text-text-muted transition-colors hover:border-border-strong hover:bg-card-raised hover:text-text-strong disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon size={15} aria-hidden />
            </button>
          ))}
        </div>
        <div role="group" aria-label="Editor view" className="inline-flex rounded-sm border border-border-strong p-0.5">
          {views.map((mode) => (
            <button
              key={mode.value}
              type="button"
              aria-pressed={view === mode.value}
              onClick={() => setView(mode.value)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                view === mode.value ? 'bg-primary text-on-primary' : 'text-text-muted hover:text-text-strong'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className={view === 'split' ? 'grid gap-3 lg:grid-cols-2' : 'grid gap-3'}>
        <textarea
          ref={textareaRef}
          id={id}
          name={props.name}
          rows={props.rows ?? 14}
          value={value}
          hidden={view === 'preview'}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${INPUT} font-display text-xs leading-relaxed`}
        />
        {view !== 'write' && (
          <div role="region" aria-label="Preview" className="min-h-24 overflow-auto rounded-md border border-border bg-bg p-4 text-sm">
            {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-xs text-text-muted">Live Markdown preview appears here.</p>}
          </div>
        )}
      </div>

      <p className="mt-1.5 font-display text-xs text-text-muted">
        {stats.words} {stats.words === 1 ? 'word' : 'words'}
        {stats.label ? ` / ${stats.label}` : ''}
      </p>
    </Wrapper>
  );
}

class UploadFailure extends Error {}

type ImageFieldProps = FieldProps & { folder: UploadFolder; recordId?: string };

/**
 * Uploads straight to S3 with a presigned PUT, then holds the public URL in a hidden input.
 * Nothing is kept until the form is saved. Needs a saved record, because keys contain its id.
 */
export function ImageField({ folder, recordId, ...props }: ImageFieldProps) {
  const { id, value: initial, describedBy } = useValue(props);
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const url = picked ?? initial;

  if (!recordId) {
    return (
      <div className="rounded-md border border-dashed border-border-strong bg-bg/50 px-3.5 py-3">
        <p className="text-sm font-medium text-text-strong">{props.label}</p>
        <p className="mt-1 text-xs text-text-muted">Save first, then add an image.</p>
      </div>
    );
  }

  async function upload(file: File) {
    const error = uploadError(folder, file.type, file.size);
    if (error) return setStatus({ text: error, error: true });
    setBusy(true);
    setStatus({ text: 'Uploading', error: false });
    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ folder, recordId, type: file.type, size: file.size }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new UploadFailure(body.message ?? 'The upload did not start. Try again.');
      const put = await fetch(body.uploadUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } });
      if (!put.ok) throw new UploadFailure('The upload failed. Try again.');
      setPicked(body.publicUrl);
      setStatus({ text: 'Uploaded. Save to keep it.', error: false });
    } catch (error) {
      setStatus({ text: error instanceof UploadFailure ? error.message : 'The upload failed. Check your connection and try again.', error: true });
    } finally {
      setBusy(false);
    }
  }

  const isLogo = folder === 'partners';
  return (
    <Wrapper {...props}>
      <input type="hidden" name={props.name} value={url} />
      {url && (
        <div className={`relative mb-3 overflow-hidden rounded-md border border-border-strong bg-bg-alt ${isLogo ? 'h-20 w-48' : 'size-36'}`}>
          <Image src={url} alt="" fill unoptimized sizes="192px" className={isLogo ? 'object-contain p-3' : 'object-cover'} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-border-strong bg-bg px-4 text-sm font-medium text-text-strong transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus hover:border-text-muted hover:bg-card-raised ${busy ? 'pointer-events-none opacity-60' : ''}`}
        >
          <Upload aria-hidden size={15} />
          <span>{url ? 'Replace image' : 'Choose image'}</span>
          <input
            id={id}
            type="file"
            accept={ACCEPTED_TYPES[folder].join(',')}
            disabled={busy}
            className="sr-only"
            aria-describedby={describedBy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void upload(file);
            }}
          />
        </label>
        {url && !busy && (
          <button
            type="button"
            onClick={() => {
              setPicked('');
              setStatus({ text: 'Removed. Save to keep the change.', error: false });
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md border border-danger/35 bg-danger/8 px-3.5 text-xs font-medium text-danger transition-colors hover:border-danger hover:bg-danger/15"
          >
            <Trash2 aria-hidden size={14} />
            <span>Remove image</span>
          </button>
        )}
      </div>
      {status && (
        <p role="status" className={`mt-1.5 text-xs font-medium ${status.error ? 'text-danger' : 'text-text-muted'}`}>
          {status.text}
        </p>
      )}
    </Wrapper>
  );
}
