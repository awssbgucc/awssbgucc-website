'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { createContext, useActionState, useContext, useId, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/admin/forms';

const FormContext = createContext<FormState>({});

export const useFormState = () => useContext(FormContext);

// A prefix unique to each form, so two forms on one page (the award rules, for example) never share an element id.
const FieldScope = createContext('');

export const useFieldId = (name: string) => `${useContext(FieldScope)}${name}`;

type AdminFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
  framed?: boolean;
  wide?: boolean;
};

export function AdminForm({ action, children, submitLabel = 'Save', framed = true, wide = false }: AdminFormProps) {
  const [state, formAction] = useActionState(action, {});
  const scope = useId();
  const widthClass = wide ? 'max-w-[920px]' : 'max-w-[680px]';
  const frameClass = framed ? 'rounded-lg border border-border-strong bg-card p-6 sm:p-7' : '';

  return (
    <FieldScope.Provider value={scope}>
      <FormContext.Provider value={state}>
        <form action={formAction} className={`flex flex-col gap-5 ${widthClass} ${frameClass}`} noValidate>
          {children}
          {state.message && (
            <div role="alert" className="flex items-start gap-2.5 rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm font-medium text-danger">
              <AlertCircle aria-hidden size={16} className="mt-0.5 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}
          {state.saved && (
            <div role="status" className="inline-flex items-center gap-2 self-start rounded-md border border-lime/40 bg-lime/10 px-3.5 py-2 text-sm font-medium text-lime">
              <CheckCircle2 aria-hidden size={16} />
              <span>Saved</span>
            </div>
          )}
          <div className="pt-1">
            <SubmitButton label={submitLabel} />
          </div>
        </form>
      </FormContext.Provider>
    </FieldScope.Provider>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-on-primary shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      {pending && <Loader2 aria-hidden size={15} className="animate-spin" />}
      <span>{pending ? 'Saving' : label}</span>
    </button>
  );
}
