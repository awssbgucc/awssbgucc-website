// Pure upload rules, shared by the image field, the presign route and the save actions.

// projects/ needs the bucket's public read policy extended to that prefix. See docs/DEPLOY.md.
export const UPLOAD_FOLDERS = ['events', 'team', 'partners', 'posts', 'projects'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const MAX_EVENT_PHOTOS = 24;

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as const;
type ImageType = keyof typeof EXTENSIONS;

const PHOTO_TYPES: ImageType[] = ['image/jpeg', 'image/png', 'image/webp'];
// Partner tiles turn logos white, so a logo needs a transparent background. No SVG in v1: see docs/ADMIN.md.
const LOGO_TYPES: ImageType[] = ['image/png', 'image/webp'];

export const ACCEPTED_TYPES: Record<UploadFolder, ImageType[]> = {
  events: PHOTO_TYPES,
  team: PHOTO_TYPES,
  posts: PHOTO_TYPES,
  projects: PHOTO_TYPES,
  partners: LOGO_TYPES,
};

const RECORD_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function isUploadFolder(value: unknown): value is UploadFolder {
  return UPLOAD_FOLDERS.includes(value as UploadFolder);
}

export function isRecordId(value: unknown): value is string {
  return typeof value === 'string' && RECORD_ID.test(value);
}

/** The message to show, or null when the file may be uploaded. */
export function uploadError(folder: UploadFolder, type: string, size: number) {
  const accepted = ACCEPTED_TYPES[folder];
  if (!accepted.includes(type as ImageType)) {
    return folder === 'partners' ? 'Use a PNG or WebP logo with a transparent background.' : 'Use a JPEG, PNG or WebP image.';
  }
  if (!Number.isInteger(size) || size <= 0) return 'This file is empty.';
  if (size > MAX_UPLOAD_BYTES) return 'This file is over 5 MB. Use a smaller image.';
  return null;
}

/** Call only after uploadError returns null for the same type. */
export function uploadKey(folder: UploadFolder, recordId: string, type: string, random: string) {
  return `${folder}/${recordId}/${random}.${EXTENSIONS[type as ImageType]}`;
}

const FILE_NAME = /^[A-Za-z0-9-]+\.(jpg|png|webp)$/;

/** True only for a file in our bucket, under the folder and record it is being saved to. */
export function isOwnUpload(url: string, baseUrl: string, folder: UploadFolder, recordId: string) {
  const prefix = `${trimSlash(baseUrl)}/${folder}/${recordId}/`;
  return isRecordId(recordId) && url.startsWith(prefix) && FILE_NAME.test(url.slice(prefix.length));
}

/** The object key for a URL in our bucket, or null for anything else. */
export function keyFromUrl(url: string, baseUrl: string) {
  const prefix = `${trimSlash(baseUrl)}/`;
  if (!url.startsWith(prefix)) return null;
  const [folder, recordId, file, ...rest] = url.slice(prefix.length).split('/');
  if (rest.length || !isUploadFolder(folder) || !isRecordId(recordId) || !FILE_NAME.test(file ?? '')) return null;
  return `${folder}/${recordId}/${file}`;
}

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}
