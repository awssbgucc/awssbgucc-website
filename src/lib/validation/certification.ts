import { z } from 'zod';
import { optionalText, requiredHttpsUrl, requiredText, status } from './shared';

export type CertLevelValue = 'FOUNDATIONAL' | 'ASSOCIATE' | 'PROFESSIONAL' | 'SPECIALTY';
export type CertPathwayValue = 'BOOTCAMP_VOUCHER' | 'AMALITECH' | 'SELF_STUDY' | 'OTHER';
export type CertTone = 'mint' | 'blue' | 'purple' | 'magenta';

export const CERT_LEVELS: { value: CertLevelValue; label: string }[] = [
  { value: 'FOUNDATIONAL', label: 'Foundational' },
  { value: 'ASSOCIATE', label: 'Associate' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'SPECIALTY', label: 'Specialty' },
];

export const CERT_PATHWAYS: { value: '' | CertPathwayValue; label: string }[] = [
  { value: '', label: 'Not specified' },
  { value: 'BOOTCAMP_VOUCHER', label: 'Bootcamp voucher' },
  { value: 'AMALITECH', label: 'AmaliTech training' },
  { value: 'SELF_STUDY', label: 'Self-study' },
  { value: 'OTHER', label: 'Other' },
];

export const CERT_LEVEL_LABEL: Record<CertLevelValue, string> = {
  FOUNDATIONAL: 'Foundational',
  ASSOCIATE: 'Associate',
  PROFESSIONAL: 'Professional',
  SPECIALTY: 'Specialty',
};

export const CERT_LEVEL_TONE: Record<CertLevelValue, CertTone> = {
  FOUNDATIONAL: 'mint',
  ASSOCIATE: 'blue',
  PROFESSIONAL: 'purple',
  SPECIALTY: 'magenta',
};

export const CERT_PATHWAY_LABEL: Record<CertPathwayValue, string> = {
  BOOTCAMP_VOUCHER: 'Bootcamp voucher',
  AMALITECH: 'AmaliTech training',
  SELF_STUDY: 'Self-study',
  OTHER: 'Other',
};

const optionalDateInput = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((value) => {
    if (value === '') return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Use a valid date.')
  .transform((value) => (value === '' ? null : new Date(`${value}T00:00:00.000Z`)));

export const certificationSchema = z.object({
  memberName: requiredText('Member name'),
  programme: z.string().optional().default('').pipe(optionalText),
  levelOfStudy: z.string().optional().default('').pipe(optionalText),
  certName: requiredText('Certification name'),
  certCode: z.string().optional().default('').pipe(optionalText),
  certLevel: z.enum(['FOUNDATIONAL', 'ASSOCIATE', 'PROFESSIONAL', 'SPECIALTY']),
  pathway: z
    .enum(['', 'BOOTCAMP_VOUCHER', 'AMALITECH', 'SELF_STUDY', 'OTHER'])
    .optional()
    .default('')
    .transform((value) => (value === '' ? null : value)),
  credlyUrl: requiredHttpsUrl,
  earnedAt: optionalDateInput,
  status,
});
