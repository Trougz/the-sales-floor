/**
 * Primary navigation. Items with `children` render as a dropdown on desktop
 * and an accordion in the mobile menu. Hash links (`/talent#join`) scroll to
 * the section on the destination page (see ScrollManager).
 */
export const NAV_ITEMS = [
  {
    label: 'For Talent',
    to: '/talent',
    children: [
      { label: 'Overview', to: '/talent', desc: 'Why sales pros join the network' },
      { label: 'Roles we recruit', to: '/talent#roles', desc: 'SDR, BDR, Account Executive' },
      { label: 'The talent network', to: '/talent#network', desc: 'See sample profiles' },
      { label: 'How to join', to: '/talent#process', desc: 'Four simple steps' },
      { label: 'Join the network', to: '/talent#join', desc: 'Two-minute profile' },
    ],
  },
  {
    label: 'For Companies',
    to: '/companies',
    children: [
      { label: 'Overview', to: '/companies', desc: 'A more direct path to talent' },
      { label: 'Roles you can hire', to: '/companies#roles', desc: 'SDR to sales leadership' },
      { label: 'Why The Sales Floor', to: '/companies#why', desc: 'Signal over noise' },
      { label: 'Start hiring', to: '/companies#hire', desc: 'Tell us who you need' },
    ],
  },
  { label: 'How It Works', to: '/process' },
  { label: 'About', to: '/about' },
  {
    label: 'Resources',
    to: '/resources',
    children: [
      { label: 'Latest insights', to: '/resources', desc: 'The content hub' },
      { label: 'Sales career advice', to: '/resources?category=career' },
      { label: 'Hiring advice', to: '/resources?category=hiring' },
      { label: 'Compensation', to: '/resources?category=compensation' },
      { label: 'Newsletter', to: '/resources#newsletter' },
    ],
  },
  { label: 'Contact', to: '/contact' },
];

export const CTA_PRIMARY = { label: 'Join the Talent Network', to: '/talent#join' };
export const CTA_SECONDARY = { label: 'Hire Sales Talent', to: '/companies#hire' };

export const FOOTER_COLUMNS = [
  {
    title: 'Talent',
    links: [
      { label: 'For Talent', to: '/talent' },
      { label: 'Roles we recruit', to: '/talent#roles' },
      { label: 'Sample profiles', to: '/talent#network' },
      { label: 'Join the network', to: '/talent#join' },
    ],
  },
  {
    title: 'Companies',
    links: [
      { label: 'For Companies', to: '/companies' },
      { label: 'Roles you can hire', to: '/companies#roles' },
      { label: 'Why The Sales Floor', to: '/companies#why' },
      { label: 'Hire sales talent', to: '/companies#hire' },
    ],
  },
  {
    title: 'The Sales Floor',
    links: [
      { label: 'How It Works', to: '/process' },
      { label: 'About', to: '/about' },
      { label: 'Resources', to: '/resources' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];
