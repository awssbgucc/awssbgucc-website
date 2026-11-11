'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { Markdown } from '@/components/site/Markdown';
import { Button } from '@/components/ui/Button';
import { ACCEPTED_TYPES, uploadError, type UploadFolder } from '@/lib/uploads/rules';
import { useFormState } from './AdminForm';

const INPUT = 'w-full rounded-sm border border-border-strong bg-bg px-3 py-2 text-base text-text';

type FieldProps = { name: string; label: string; help?: string; defaultValue?: string | number | null };

function Wrapper({ name, label, help, children }: { name: string; label: string; help?: string; children: ReactNode }) {
  const error = useFormState().errors?.[name];
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {help && (
        <p id={`${name}-help`} className="mt-1.5 text-sm text-text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** After a failed save, what was typed wins over the saved value. */
function useValue({ name, defaultValue }: FieldProps) {
  const state = useFormState();
  const describedBy = state.errors?.[name] ? `${name}-error` : undefined;
  return { value: state.values?.[name] ?? String(defaultValue ?? ''), describedBy, invalid: !!state.errors?.[name] };
}

export function TextField({ type = 'text', ...props }: FieldProps & { type?: string }) {
  const { value, describedBy, invalid } = useValue(props);
  return (
    <Wrapper {...props}>
      {/* The key re-applies the value, because React resets a form after its action runs. */}
      <input key={value} id={props.name} name={props.name} type={type} defaultValue={value} aria-invalid={invalid} aria-describedby={describedBy} className={`${INPUT} min-h-11`} />
    </Wrapper>
  );
}

export function TextArea({ rows = 3, ...props }: FieldProps & { rows?: number }) {
  const { value, describedBy, invalid } = useValue(props);
  return (
    <Wrapper {...props}>
      <textarea key={value} id={props.name} name={props.name} rows={rows} defaultValue={value} aria-invalid={invalid} aria-describedby={describedBy} className={INPUT} />
    </Wrapper>
  );
}

export function SelectField({ options, ...props }: FieldProps & { options: { value: string; label: string }[] }) {
  const { value, describedBy, invalid } = useValue(props);
  return (
    <Wrapper {...props}>
      <select key={value} id={props.name} name={props.name} defaultValue={value} aria-invalid={invalid} aria-describedby={describedBy} className={`${INPUT} min-h-11`}>
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
    <div>
      <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
        <input key={String(checked)} type="checkbox" name={name} defaultChecked={checked} className="size-5 accent-white" />
        {label}
      </label>
      {help && <p className="text-sm text-text-muted">{help}</p>}
    </div>
  );
}

export function MarkdownField(props: FieldProps & { rows?: number }) {
  const { value: initial, describedBy, invalid } = useValue(props);
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? initial;
  return (
    <Wrapper {...props}>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          id={props.name}
          name={props.name}
          rows={props.rows ?? 14}
          value={value}
          onChange={(event) => setDraft(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={`${INPUT} font-display text-sm`}
        />
        <div aria-label="Preview" className="min-h-24 overflow-auto rounded-sm border border-border p-3">
          <Markdown>{value}</Markdown>
        </div>
      </div>
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
  const { value: initial } = useValue(props);
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const url = picked ?? initial;

  if (!recordId) {
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium">{props.label}</p>
        <p className="text-sm text-text-muted">Save first, then add an image.</p>
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
        <div className={`relative mb-3 overflow-hidden rounded-sm border border-border bg-card-raised ${isLogo ? 'h-20 w-48' : 'size-40'}`}>
          <Image src={url} alt="" fill unoptimized sizes="192px" className={isLogo ? 'object-contain p-3' : 'object-cover'} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-border-strong px-5 text-sm font-medium text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white hover:border-text-muted ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          {url ? 'Replace image' : 'Choose image'}
          <input
            id={props.name}
            type="file"
            accept={ACCEPTED_TYPES[folder].join(',')}
            disabled={busy}
            className="sr-only"
            aria-describedby={props.help ? `${props.name}-help` : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void upload(file);
            }}
          />
        </label>
        {url && !busy && (
          <Button variant="text" onClick={() => { setPicked(''); setStatus({ text: 'Removed. Save to keep the change.', error: false }); }}>
            Remove image
          </Button>
        )}
      </div>
      {status && (
        <p role="status" className={`mt-1.5 text-sm font-medium ${status.error ? 'text-danger' : 'text-text-muted'}`}>
          {status.text}
        </p>
      )}
    </Wrapper>
  );
}
