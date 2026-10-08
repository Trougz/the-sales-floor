/**
 * Primary navigation: one flat button per page. Each page carries its own sections
 * (e.g. /talent has roles, profiles, process and the join form), so there are no
 * dropdowns. Hash links in the CTAs/footer (`/talent#join`) scroll to the section on
 * the destination page (see ScrollManager).
 */
export const NAV_ITEMS = [
  { label: 'For Talent', to: '/talent' },
  { label: 'For Companies', to: '/companies' },
  { label: 'About', to: '/about' },
];

export const CTA_PRIMARY = { label: 'Join the Talent Network', to: '/talent#join' };
export const CTA_SECONDARY = { label: 'Hire Sales Talent', to: '/companies#hire' };

export const FOOTER_COLUMNS = [
  {
    title: 'Talent',
    links: [
      { label: 'For Talent', to: '/talent' },
      { label: 'Roles we recruit', to: '/talent#roles' },
      { label: 'Join the network', to: '/talent#join' },
    ],
  },
  {
    title: 'Companies',
    links: [
      { label: 'For Companies', to: '/companies' },
      { label: 'Roles you can hire', to: '/companies#roles' },
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
