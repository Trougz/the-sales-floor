import { Compass, Handshake, ScanSearch, Search, SlidersHorizontal, UserPlus, UserCheck, ListChecks } from 'lucide-react';

/** Candidate journey (copy from the brief). Used on Home, Talent, and How It Works. */
export const TALENT_STEPS = [
  { title: 'Join the network', body: 'Tell us about yourself and what you’re looking for.', icon: UserPlus },
  { title: 'Tell us what you want', body: 'Role, compensation, industry, location, and work preferences.', icon: SlidersHorizontal },
  { title: 'We identify relevant opportunities', body: 'We look for opportunities that match your profile.', icon: Search },
  { title: 'Get introduced', body: 'When there’s a fit, we make the connection.', icon: Handshake },
];

/** Company journey, 4-step version (How It Works + Home). */
export const COMPANY_STEPS = [
  { title: 'Tell us who you’re looking for', body: 'Role, seniority, experience, industry, compensation, location, and the details that matter.', icon: ListChecks },
  { title: 'We understand the profile', body: 'We talk it through so we know what a strong hire looks like for your team.', icon: Compass },
  { title: 'We identify relevant talent', body: 'We use the network to surface salespeople who fit the profile.', icon: ScanSearch },
  { title: 'Meet the people who fit', body: 'Meet relevant candidates and decide whether there’s a fit.', icon: UserCheck },
];

/** Company journey, 3-step version (Companies page). */
export const COMPANY_PAGE_STEPS = [
  { title: 'Tell us who you’re hiring for', body: 'Role, seniority, experience, industry, compensation, location, and other relevant criteria.', icon: ListChecks },
  { title: 'We identify relevant talent', body: 'We use the network to surface salespeople who fit the profile.', icon: ScanSearch },
  { title: 'We make the introduction', body: 'Meet relevant candidates and decide whether there is a fit.', icon: Handshake },
];
