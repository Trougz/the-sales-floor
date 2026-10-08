import { Headphones, Phone, Target } from 'lucide-react';

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
