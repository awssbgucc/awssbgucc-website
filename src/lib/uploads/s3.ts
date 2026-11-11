import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isOwnUpload, keyFromUrl, type UploadFolder } from './rules';

// Credentials come from the SDK's default chain: the Amplify compute role in production,
// AWS_PROFILE locally. No keys are stored in environment variables. See docs/DEPLOY.md.
let client: S3Client | undefined;

function s3() {
  // Checksums stay off for presigned PUTs, or the browser would have to send one.
  client ??= new S3Client({ region: process.env.S3_REGION, requestChecksumCalculation: 'WHEN_REQUIRED' });
  return client;
}

function bucket() {
  const name = process.env.S3_BUCKET;
  if (!name) throw new Error('S3_BUCKET is not set');
  return name;
}

/** Null when uploads are not set up, as in tests. Then no URL counts as one of ours. */
export function publicBaseUrl() {
  return process.env.S3_PUBLIC_BASE_URL?.replace(/\/+$/, '') || null;
}

/**
 * The type and exact size are signed, so S3 refuses any other file sent to this URL.
 * The SDK leaves content-type unsigned unless it is named here.
 */
export function presignUpload(key: string, type: string, size: number) {
  const command = new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: type, ContentLength: size });
  return getSignedUrl(s3(), command, { expiresIn: 300, signableHeaders: new Set(['content-type']) });
}

/** The field error for an image URL, or null. The saved value may stay as it is. */
export function imageError(next: string | null, current: string | null, folder: UploadFolder, recordId: string | null) {
  if (!next || next === current) return null;
  const base = publicBaseUrl();
  return base && recordId && isOwnUpload(next, base, folder, recordId) ? null : 'Upload the image again.';
}

/**
 * Deletes files from our bucket that are no longer used. Call after the database write.
 * A failed delete leaves an unused file behind, so it is logged and the save still succeeds.
 */
export async function deleteUnused(previous: (string | null | undefined)[], kept: (string | null | undefined)[] = []) {
  const base = publicBaseUrl();
  if (!base) return;
  const keys = previous
    .filter((url): url is string => !!url && !kept.includes(url))
    .map((url) => keyFromUrl(url, base))
    .filter((key): key is string => key !== null);
  await Promise.all(
    keys.map((key) =>
      s3()
        .send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
        .catch((error: unknown) => console.error(`Could not delete ${key} from S3`, error)),
    ),
  );
}
