export const SITE_NAME = 'AWS Student Builder Group at University of Cape Coast';
export const SITE_DESCRIPTION =
  'Student-led AWS community at the University of Cape Coast, open to students from every department. Online talks, bootcamps and hands-on campus sessions.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const AWS_EVENT_TERMS_URL = 'https://aws.amazon.com/events/terms/';
export const DEFAULT_SOCIAL_URLS = {
  linkedin: 'https://www.linkedin.com/company/awssbgucc',
  instagram: 'https://www.instagram.com/awssbgucc',
  x: 'https://x.com/awssbgucc',
} as const;
