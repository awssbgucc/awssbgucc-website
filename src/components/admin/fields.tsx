'use client';

import { useState, type ReactNode } from 'react';
import { Markdown } from '@/components/site/Markdown';
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
