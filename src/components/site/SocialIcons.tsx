import { Mail } from 'lucide-react';

export type SocialKind = 'meetup' | 'linkedin' | 'github' | 'instagram' | 'x' | 'whatsapp' | 'email';

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
    case 'github':
      return (
        <svg {...base} fill="currentColor">
          <path d="M12 2.25C6.615 2.25 2.25 6.615 2.25 12C2.25 16.31 5.04 19.96 8.915 21.25C9.4 21.34 9.575 21.04 9.575 20.785C9.575 20.555 9.565 19.785 9.565 18.975C6.85 19.565 6.28 17.825 6.28 17.825C5.835 16.695 5.195 16.395 5.195 16.395C4.31 15.79 5.265 15.805 5.265 15.805C6.245 15.875 6.76 16.81 6.76 16.81C7.63 18.3 9.04 17.87 9.595 17.62C9.68 16.99 9.935 16.56 10.215 16.315C8.05 16.07 5.775 15.23 5.775 11.495C5.775 10.43 6.155 9.56 6.775 8.88C6.675 8.635 6.34 7.645 6.87 6.305C6.87 6.305 7.685 6.045 9.545 7.305C10.32 7.09 11.155 6.98 11.985 6.975C12.815 6.98 13.65 7.09 14.425 7.305C16.285 6.045 17.1 6.305 17.1 6.305C17.63 7.645 17.295 8.635 17.195 8.88C17.82 9.56 18.195 10.43 18.195 11.495C18.195 15.24 15.915 16.065 13.74 16.305C14.09 16.605 14.405 17.2 14.405 18.11C14.405 19.415 14.395 20.465 14.395 20.785C14.395 21.04 14.57 21.345 15.065 21.25C18.935 19.955 21.725 16.305 21.725 12C21.725 6.615 17.36 2.25 12 2.25Z" />
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
