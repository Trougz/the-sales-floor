import { BellOff, Crosshair, Gem, HeartHandshake, Layers, Link2, MessageSquareText, Radar, Scale, ShieldCheck, Sparkles, Users } from 'lucide-react';

/** Why sales talent joins (Talent page). */
export const WHY_JOIN = [
  { title: 'Stop endlessly applying', body: 'Skip the application treadmill. Build one profile and let relevant opportunities come to you.', icon: Link2 },
  { title: 'Get introduced to relevant companies', body: 'We match your background to companies hiring for people like you, not every open req.', icon: Users },
  { title: 'Tell us what you’re looking for', body: 'Role, compensation, industry, location, work style. Your preferences decide who we introduce you to.', icon: MessageSquareText },
  { title: 'Stay connected to opportunities', body: 'Even when timing isn’t right today, you’re on our radar for when the right role opens.', icon: Radar },
  { title: 'Opportunities without recruiter spam', body: 'No mass emails or generic blasts. We reach out when there’s a genuine fit.', icon: BellOff },
];

/** Why companies use The Sales Floor (Companies page). */
export const COMPANY_PRINCIPLES = [
  { title: 'Signal over noise', body: 'Focus on relevant people rather than endless resumes.', icon: Crosshair },
  { title: 'Sales-native recruiting', body: 'Built around an understanding of modern sales roles.', icon: Sparkles },
  { title: 'Relevant introductions', body: 'The goal is better matches, not more introductions.', icon: Layers },
  { title: 'Built around fit', body: 'Experience, industry, compensation, location, and goals all matter.', icon: Scale },
];

/** About page pillars. */
export const ABOUT_PILLARS = [
  { title: 'Sales-native recruiting', body: 'We think about sales roles the way sellers and sales leaders do, not the way a generic recruiter reads a job description.', icon: Sparkles },
  { title: 'A curated network', body: 'A network you join with a profile, not a database you get lost in. Curated means we look at who’s in it.', icon: Gem },
  { title: 'Better introductions', body: 'We’d rather make fewer, more relevant introductions than flood either side with volume.', icon: HeartHandshake },
  { title: 'Modern sales organizations', body: 'We focus on startups and growth-stage companies building their sales teams.', icon: Layers },
  { title: 'Founder-led origins', body: 'The Sales Floor is founder-led, and the way we work with talent and companies reflects that.', icon: ShieldCheck },
];

/** Philosophy (About page). */
export const PHILOSOPHY = [
  { title: 'Quality over quantity', body: 'A short list of the right people beats a long list of maybes. That’s true for candidates and for companies.' },
  { title: 'Relevant introductions', body: 'An introduction should have a reason. If we can’t explain why two sides should meet, we don’t make the introduction.' },
  { title: 'Salespeople understand salespeople', body: 'Sales is a craft with its own signals. It takes a sales-native lens to read them properly.' },
  { title: 'Fit matters', body: 'Skills get someone in the door. Fit — role, team, comp, location, goals — is what makes the hire last.' },
  { title: 'Relationships matter', body: 'Great hiring is built on trust with both sides, and trust takes conversations, not just profiles.' },
];

/** "Not another job board" comparison (Home + How It Works). */
export const COMPARISON = {
  usual: {
    title: 'The usual way',
    rows: ['Apply to posting after posting and hope', 'Sort through endless resumes', 'Recruiters who blast every opening', 'Keyword matching on a job title'],
  },
  floor: {
    title: 'The Sales Floor way',
    rows: ['Tell us what you want once', 'Meet the few people who actually fit', 'Introductions only when there’s a reason', 'Fit on experience, industry, comp, location, and goals'],
  },
};
