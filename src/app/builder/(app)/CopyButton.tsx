'use client';

import { useState } from 'react';

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" onClick={copy} className="min-h-11 text-sm font-medium text-text-muted underline underline-offset-4 hover:text-white">
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}
