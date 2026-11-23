import { Mail } from 'lucide-react';

export type SocialKind = 'meetup' | 'linkedin' | 'instagram' | 'x' | 'whatsapp' | 'email';

/** Clean social icons that inherit currentColor so they work in both dark and light themes. */
export function SocialIcon({ kind, size = 18 }: { kind: SocialKind; size?: number }) {
  if (kind === 'email') return <Mail size={size} strokeWidth={1.75} aria-hidden />;

  const base = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  switch (kind) {
    case 'linkedin':
      return (
        <svg {...base} fill="currentColor">
          <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3.5C4.14 3.5 3.25 4.39 3.25 5.5C3.25 6.6 4.14 7.5 5.25 7.5C6.35 7.5 7.25 6.6 7.25 5.5C7.25 4.39 6.35 3.5 5.25 3.5ZM20.44 13.02C20.44 9.88 18.76 8.22 16.16 8.22C14.37 8.22 13.48 9.2 13.02 9.93V8.5H9.65C9.7 9.46 9.65 19.5 9.65 19.5H13.02V13.36C13.02 13.02 13.05 12.69 13.15 12.45C13.42 11.78 14.03 11.09 15.07 11.09C16.41 11.09 17.06 12.11 17.06 13.6V19.5H20.44V13.02Z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5" />
          <circle cx="12" cy="12" r="4.25" />
          <circle cx="17.25" cy="6.75" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'x':
      return (
        <svg {...base} fill="currentColor">
          <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
      );
    case 'meetup':
      return (
        <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 18.5V6.5L9.5 13.5L14.5 6.5V18.5" />
          <path d="M14.5 11.5C15.5 9.8 17 9 18.2 9.4C19.6 9.9 19.8 11.7 19.5 13.5L18.5 18.5" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.5 11.8A8.5 8.5 0 0 1 8.1 19.3L3.5 20.5L4.8 16A8.5 8.5 0 1 1 20.5 11.8Z" />
          <path d="M9.5 9.2C9.2 9.5 9 10.3 9.7 11.6C10.5 13 11.8 14 13.2 14.5C14.1 14.8 14.7 14.5 15 14.1L14.3 12.9C14.1 12.6 13.8 12.6 13.5 12.7L12.8 13C12.1 12.7 11.3 11.9 11 11.2L11.3 10.5C11.4 10.2 11.4 9.9 11.1 9.7L10.2 8.9C9.9 8.8 9.7 8.9 9.5 9.2Z" />
        </svg>
      );
  }
}
