import { BellOff, Link2, MessageSquareText, Radar, Users } from 'lucide-react';

/** Why sales talent joins (Talent page). */
export const WHY_JOIN = [
  { title: 'Stop endlessly applying', body: 'Skip the application treadmill. Build one profile and let relevant opportunities come to you.', icon: Link2 },
  { title: 'Get introduced to relevant companies', body: 'We match your background to companies hiring for people like you, not every open req.', icon: Users },
  { title: 'Tell us what you’re looking for', body: 'Role, compensation, industry, location, work style. Your preferences decide who we introduce you to.', icon: MessageSquareText },
  { title: 'Stay connected to opportunities', body: 'Even when timing isn’t right today, you’re on our radar for when the right role opens.', icon: Radar },
  { title: 'Opportunities without recruiter spam', body: 'No mass emails or generic blasts. We reach out when there’s a genuine fit.', icon: BellOff },
];

/** Philosophy (About page). */
export const PHILOSOPHY = [
  { title: 'Quality over quantity', body: 'A short list of the right people beats a long list of maybes. That’s true for candidates and for companies.' },
  { title: 'Relevant introductions', body: 'An introduction should have a reason. If we can’t explain why two sides should meet, we don’t make the introduction.' },
  { title: 'Salespeople understand salespeople', body: 'Sales is a craft with its own signals. It takes a sales-native lens to read them properly.' },
  { title: 'Fit matters', body: 'Skills get someone in the door. Fit — role, team, comp, location, goals — is what makes the hire last.' },
  { title: 'Relationships matter', body: 'Great hiring is built on trust with both sides, and trust takes conversations, not just profiles.' },
];
