import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { currentAdmin } from '@/lib/auth';
import { currentMember } from '@/lib/member';
import { db } from '@/lib/db';
import { uploadError, uploadKey, type UploadFolder } from '@/lib/uploads/rules';
import { presignUpload, publicBaseUrl } from '@/lib/uploads/s3';
import { uploadRequestSchema } from '@/lib/validation/upload';

// Returns a presigned PUT, so the browser sends the file straight to S3. The server never handles the bytes.

const fail = (status: number, message: string) => NextResponse.json({ message }, { status });

function recordExists(folder: UploadFolder, id: string) {
  const where = { where: { id }, select: { id: true } };
  switch (folder) {
    case 'events':
      return db.event.findUnique(where);
    case 'team':
      return db.teamMember.findUnique(where);
    case 'partners':
      return db.partner.findUnique(where);
    case 'posts':
      return db.post.findUnique(where);
    case 'projects':
      return db.project.findUnique(where);
  }
}

/**
 * Admins may upload to any record. A member may upload only a project image, only to a project they own.
 * Member projects are reviewed before anything shows publicly.
 */
async function mayUpload(folder: UploadFolder, recordId: string) {
  if (await currentAdmin()) return true;
  if (folder !== 'projects') return false;
  const member = await currentMember();
  if (!member) return false;
  return !!(await db.project.findFirst({ where: { id: recordId, ownerId: member.user.id }, select: { id: true } }));
}

export async function POST(request: Request) {
  const parsed = uploadRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    // Signed-out callers learn nothing about the request format.
    if (!(await currentAdmin()) && !(await currentMember())) return fail(401, 'Sign in again to upload.');
    return fail(400, 'This upload request is not valid.');
  }
  const { folder, recordId, type, size } = parsed.data;
  if (!(await mayUpload(folder, recordId))) return fail(401, 'Sign in again to upload.');
  const error = uploadError(folder, type, size);
  if (error) return fail(400, error);
  const base = publicBaseUrl();
  if (!base) return fail(503, 'Uploads are not set up yet.');
  if (!(await recordExists(folder, recordId))) return fail(404, 'Save first, then add an image.');
  const key = uploadKey(folder, recordId, type, randomUUID());
  return NextResponse.json({ uploadUrl: await presignUpload(key, type, size), publicUrl: `${base}/${key}` });
}
