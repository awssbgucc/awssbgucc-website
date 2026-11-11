export type NavItem = { href: string; label: string; icon: IconName };

export type IconName = 'home' | 'sessions' | 'checkin' | 'challenges' | 'projects' | 'progress' | 'rewards' | 'community' | 'notifications' | 'profile';

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Build',
    items: [
      { href: '/builder', label: 'Home', icon: 'home' },
      { href: '/builder/sessions', label: 'Sessions', icon: 'sessions' },
      { href: '/builder/check-in', label: 'Check in', icon: 'checkin' },
      { href: '/builder/challenges', label: 'Challenges', icon: 'challenges' },
      { href: '/builder/projects', label: 'Projects', icon: 'projects' },
    ],
  },
  {
    title: 'Record',
    items: [
      { href: '/builder/progress', label: 'Progress', icon: 'progress' },
      { href: '/builder/rewards', label: 'Rewards', icon: 'rewards' },
    ],
  },
  {
    title: 'Community',
    items: [
      { href: '/builder/community', label: 'Members and projects', icon: 'community' },
      { href: '/builder/notifications', label: 'Notifications', icon: 'notifications' },
      { href: '/builder/profile', label: 'Profile', icon: 'profile' },
    ],
  },
];

/** The four destinations on the phone bar. Everything else sits behind More. */
export const MOBILE_PRIMARY = ['/builder', '/builder/sessions', '/builder/check-in', '/builder/challenges'];

export function isActive(pathname: string, href: string) {
  return href === '/builder' ? pathname === '/builder' : pathname === href || pathname.startsWith(`${href}/`);
}
