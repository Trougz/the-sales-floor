import { Crown, Headphones, Rocket, Target, TrendingUp, Trophy, Users, Phone } from 'lucide-react';

/**
 * CONFIRMED roles — the ones The Sales Floor recruits for today (SDR, BDR, AE).
 * `talent` copy speaks to the rep; `company` copy speaks to the hiring team.
 */
export const CORE_ROLES = [
  {
    id: 'sdr',
    short: 'SDR',
    title: 'Sales Development Rep',
    icon: Headphones,
    talent: 'The front door to a sales career. Qualify demand, book meetings, and learn what great pipeline looks like.',
    company: 'Reps who qualify demand quickly, follow up with discipline, and book meetings that actually happen.',
    skills: ['Lead qualification', 'Meeting-setting', 'Outreach cadences'],
  },
  {
    id: 'bdr',
    short: 'BDR',
    title: 'Business Development Rep',
    icon: Phone,
    talent: 'Outbound-first. Research target accounts, personalize your outreach, and create pipeline where none exists.',
    company: 'Outbound builders who open new accounts and create pipeline through research, persistence, and craft.',
    skills: ['Outbound prospecting', 'Account research', 'Multi-channel outreach'],
  },
  {
    id: 'ae',
    short: 'AE',
    title: 'Account Executive',
    icon: Target,
    talent: 'Own the deal from first conversation to close: discovery, demos, negotiation, and the number.',
    company: 'Closers who run a full sales cycle, manage a pipeline, and carry a quota with judgment.',
    skills: ['Discovery & demos', 'Negotiation & close', 'Pipeline ownership'],
  },
];

/**
 * EXPANDING roles — NOT confirmed on the current live site (which lists SDR / BDR / AE, and mentions
 * Sales Managers only in passing). Shown with an "Expanding" marker so nothing is over-promised.
 * Promote an entry into CORE_ROLES once it's a real, staffed offering.
 */
export const EXPANDING_ROLES = [
  { id: 'mm-ae', title: 'Mid-Market AE', icon: TrendingUp, blurb: 'Full-cycle AEs selling to mid-sized teams with shorter, multi-threaded deals.' },
  { id: 'ent-ae', title: 'Enterprise AE', icon: Trophy, blurb: 'Strategic sellers running long, complex cycles into large accounts.' },
  { id: 'founding-ae', title: 'Founding AE', icon: Rocket, blurb: 'Builders who can sell before the playbook exists and help write it.' },
  { id: 'manager', title: 'Sales Manager', icon: Users, blurb: 'First-line leaders who coach, inspect pipeline, and grow a team.' },
];

/** Shown on the Companies page alongside the core roles. */
export const LEADERSHIP_ROLE = {
  id: 'leadership',
  short: 'Leadership',
  title: 'Sales Leadership',
  icon: Crown,
  company: 'Front-line managers and sales leaders who build, coach, and scale a team.',
  skills: ['Team building', 'Coaching & inspection', 'Forecasting'],
};
