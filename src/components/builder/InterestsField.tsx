'use client';

import { useFormState } from '@/components/admin/AdminForm';
import { INTERESTS } from '@/lib/platform/customise';

/** Interest chips inside an AdminForm. After a failed save, the ticked ones come back from the form state. */
export function InterestsField({ selected }: { selected: string[] }) {
  const state = useFormState();
  const picked = state.values?.interests !== undefined ? state.values.interests.split('|') : selected;
  return (
    <div role="group" aria-labelledby="interests-label">
      <p id="interests-label" className="mb-3 text-sm font-medium">
        Interests <span className="text-text-muted">(up to six)</span>
      </p>
      <div key={picked.join('|')} className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => (
          <label key={interest} className="cursor-pointer">
            <input type="checkbox" name="interests" value={interest} defaultChecked={picked.includes(interest)} className="peer sr-only" />
            <span className="inline-flex min-h-10 items-center rounded-full border border-border-strong px-3.5 text-sm font-medium text-text-muted transition-colors duration-150 ease-brand peer-checked:border-lime peer-checked:bg-lime/8 peer-checked:text-lime peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan hover:text-white">
              {interest}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
