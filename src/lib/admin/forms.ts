import type { z } from 'zod';

export type FormState = {
  errors?: Record<string, string>;
  message?: string;
  /** What was typed, so a failed save does not clear the form. */
  values?: Record<string, string>;
  saved?: boolean;
};

export function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === 'string' && !key.startsWith('$ACTION')) values[key] = value;
  });
  return values;
}

/** Missing keys are passed through, so an unticked checkbox reads as off. */
export function parseForm<S extends z.ZodType>(schema: S, formData: FormData) {
  const values = formValues(formData);
  const result = schema.safeParse(values);
  if (result.success) return { ok: true as const, data: result.data as z.output<S> };
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= issue.message;
  }
  return { ok: false as const, state: { errors, values } satisfies FormState };
}

/** Prisma's unique constraint error, without importing the generated client here. */
export function isUniqueError(error: unknown) {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}
