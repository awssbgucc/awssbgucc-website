'use client';

import { createContext, useActionState, useContext, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import type { FormState } from '@/lib/admin/forms';

const FormContext = createContext<FormState>({});

export const useFormState = () => useContext(FormContext);

type AdminFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: ReactNode;
  submitLabel?: string;
};

export function AdminForm({ action, children, submitLabel = 'Save' }: AdminFormProps) {
  const [state, formAction] = useActionState(action, {});
  return (
    <FormContext.Provider value={state}>
      <form action={formAction} className="flex max-w-[640px] flex-col gap-6" noValidate>
        {children}
        {state.message && (
          <p role="alert" className="text-sm font-medium text-danger">
            {state.message}
          </p>
        )}
        {state.saved && (
          <p role="status" className="text-sm font-medium text-lime">
            Saved
          </p>
        )}
        <div>
          <SubmitButton label={submitLabel} />
        </div>
      </form>
    </FormContext.Provider>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving' : label}
    </Button>
  );
}
