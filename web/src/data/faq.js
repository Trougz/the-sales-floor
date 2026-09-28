/**
 * FAQ content. `audiences` controls which tab(s) an entry appears in.
 * Answers are arrays of paragraphs; `link` renders an inline call to action.
 */
export const FAQ_ITEMS = [
  {
    id: 'who',
    q: 'Who can join?',
    audiences: ['talent'],
    a: ['Any B2B sales professional. If you’re an SDR, BDR, or Account Executive, or working toward one of those roles, you can join. Sign up with a short profile and we’ll review it.'],
    link: { label: 'Join the Talent Network', to: '/talent#join' },
  },
  {
    id: 'cost',
    q: 'Does it cost anything?',
    audiences: ['talent', 'companies'],
    a: ['No. Joining the network is free for sales talent.', 'For companies, we’ll walk through how we work when we talk about who you’re hiring for.'],
  },
  {
    id: 'active',
    q: 'Do I need to be actively looking?',
    audiences: ['talent'],
    a: ['No. Some of the best salespeople aren’t on the market until the right opportunity shows up. Join once, tell us what you’d want, and we’ll only reach out when there’s a relevant fit.'],
  },
  {
    id: 'roles',
    q: 'What roles do you recruit?',
    audiences: ['talent', 'companies'],
    a: ['Primarily Account Executives, SDRs, and BDRs at startups and growth-stage software companies.', 'Hiring for something adjacent, like a sales manager or a founding AE? Tell us. We’ll be straight with you about whether it’s a fit.'],
  },
  {
    id: 'match',
    q: 'How are candidates matched?',
    audiences: ['talent', 'companies'],
    a: ['By people, not keyword filters. Our recruiters review each profile and compare it with what a company is hiring for. Experience, industry, compensation, location, and goals all count. When it fits, we make the introduction.'],
  },
  {
    id: 'companies',
    q: 'What companies do you work with?',
    audiences: ['talent', 'companies'],
    a: ['Startups and growth-stage companies hiring sales talent, including Pepper and NOSO Labs.'],
  },
  {
    id: 'process',
    q: 'How does the hiring process work?',
    audiences: ['talent', 'companies'],
    a: ['Screening, a call, then interviews. We screen the profile first, then talk with you to understand what you’re looking for (or, for companies, who you need). When there’s a fit, we make the introduction and interviews take it from there.'],
    link: { label: 'See the full process', to: '/process' },
  },
  {
    id: 'start',
    q: 'How do companies get started?',
    audiences: ['companies'],
    a: ['Sign up. Tell us who you’re hiring for (role, seniority, compensation, location, timeline) and we’ll take it from there.'],
    link: { label: 'Hire Sales Talent', to: '/companies#hire' },
  },
];
