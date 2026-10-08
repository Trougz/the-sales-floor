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

/** The single button on the right of the header (and at the bottom of the mobile menu): the combined talent / company form. */
export const NAV_ACTION = { label: 'Join The Sales Floor', to: '/join' };

/** The "Join the Community" button under the choice on /join. Placeholder destination: there is no community page or signup yet, so it goes to Contact. Repoint here only. */
export const COMMUNITY_ACTION = { label: 'Join the Community', to: '/contact' };

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
