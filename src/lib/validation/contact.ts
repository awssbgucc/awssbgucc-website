import { z } from 'zod';

export const CONTACT_TOPICS = [
  {
    value: 'partnership',
    label: 'Partnership',
    tone: 'mint',
    note: 'Campus associations, tech companies and external organisations',
  },
  {
    value: 'speaking',
    label: 'Speaking or workshop',
    tone: 'purple',
    note: 'Guest talks, hands-on labs and career sessions',
  },
  {
    value: 'sponsorship',
    label: 'Sponsorship',
    tone: 'blue',
    note: 'Supporting build sessions, bootcamps, swag or Community Day',
  },
  {
    value: 'general',
    label: 'General enquiry',
    tone: 'magenta',
    note: 'Membership, events or anything else',
  },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]['value'];

const TOPIC_VALUES = CONTACT_TOPICS.map((t) => t.value) as [ContactTopic, ...ContactTopic[]];

export function isContactTopic(value: string | null | undefined): value is ContactTopic {
  return !!value && CONTACT_TOPICS.some((t) => t.value === value);
}

export function topicLabel(topic: ContactTopic) {
  return CONTACT_TOPICS.find((t) => t.value === topic)?.label ?? 'General enquiry';
}

export const contactSchema = z.object({
  topic: z.enum(TOPIC_VALUES, { message: 'Choose what your message is about.' }),
  name: z.string().trim().min(2, 'Enter your name.').max(100, 'Keep your name to 100 characters.'),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.')).refine((v) => v.length <= 160, 'Email address is too long.'),
  organisation: z
    .string()
    .trim()
    .max(120, 'Keep the organisation name to 120 characters.')
    .optional()
    .transform((v) => v || null),
  subject: z
    .string()
    .trim()
    .max(140, 'Keep the subject to 140 characters.')
    .optional()
    .transform((v) => v || null),
  message: z
    .string()
    .trim()
    .min(10, 'Write at least a short message (10 characters or more).')
    .max(2000, 'Keep your message to 2,000 characters.'),
  // Honeypot field: real visitors never see or fill this.
  website: z.string().optional().default(''),
});

export type ContactPayload = z.infer<typeof contactSchema>;
