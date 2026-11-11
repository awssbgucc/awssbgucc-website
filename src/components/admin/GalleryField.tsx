'use client';

import Image from 'next/image';
import { useState } from 'react';
import { uploadError } from '@/lib/uploads/rules';

/**
 * Event photos. Each file goes straight to S3 with a presigned PUT, like ImageField.
 * The list is kept in hidden inputs and saved with the form.
 */
export function GalleryField({ eventId, initial, max }: { eventId: string; initial: string[]; max: number }) {
  const [photos, setPhotos] = useState(initial);
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: File[]) {
    const room = max - photos.length;
    if (files.length > room) return setStatus({ text: `There is room for ${room} more.`, error: true });
    setBusy(true);
    const added: string[] = [];
    for (const [index, file] of files.entries()) {
      const error = uploadError('events', file.type, file.size);
      if (error) {
        setStatus({ text: `${file.name}: ${error}`, error: true });
        continue;
      }
      setStatus({ text: `Uploading ${index + 1} of ${files.length}`, error: false });
      try {
        const response = await fetch('/api/uploads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ folder: 'events', recordId: eventId, type: file.type, size: file.size }) });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message ?? 'The upload did not start.');
        const put = await fetch(body.uploadUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } });
        if (!put.ok) throw new Error('The upload failed.');
        added.push(body.publicUrl);
      } catch (error) {
        setStatus({ text: `${file.name}: ${error instanceof Error ? error.message : 'The upload failed.'}`, error: true });
      }
    }
    setPhotos((current) => [...current, ...added]);
    setBusy(false);
    if (added.length) setStatus({ text: `${added.length} uploaded. Save to keep them.`, error: false });
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Photos</p>
      <p className="mb-3 text-sm text-text-muted">Only photos the group took, of people who agreed to be shown. Remove location data first. Up to {max}.</p>
      {photos.map((url) => (
        <input key={url} type="hidden" name="photos" value={url} />
      ))}
      {photos.length > 0 && (
        <ul className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((url, index) => (
            <li key={url} className="relative aspect-[3/2] overflow-hidden rounded-sm border border-border">
              <Image src={url} alt={`Photo ${index + 1}`} fill unoptimized sizes="160px" className="object-cover" />
              <button type="button" onClick={() => setPhotos(photos.filter((p) => p !== url))} className="absolute top-1 right-1 rounded-sm bg-bg/90 px-2 py-1 text-xs font-medium text-white">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className={`inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-border-strong px-5 text-sm font-medium text-white focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cyan hover:border-text-muted ${busy ? 'pointer-events-none opacity-60' : ''}`}>
        Add photos
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || photos.length >= max}
          className="sr-only"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = '';
            if (files.length) void upload(files);
          }}
        />
      </label>
      {status && (
        <p role="status" className={`mt-2 text-sm font-medium ${status.error ? 'text-danger' : 'text-text-muted'}`}>
          {status.text}
        </p>
      )}
    </div>
  );
}
