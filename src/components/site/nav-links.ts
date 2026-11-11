export const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/projects', label: 'Projects' },
  { href: '/team', label: 'Team' },
  { href: '/blog', label: 'Writing' },
];

/** The Community Day link appears only while its page is switched on. */
export function navLinks(scdPageEnabled: boolean) {
  return scdPageEnabled ? [...NAV_LINKS, { href: '/scd', label: 'Community Day' }] : NAV_LINKS;
}
