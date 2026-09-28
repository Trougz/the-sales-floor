/**
 * SAMPLE / FUTURE content for the Resources hub. None of these are published articles —
 * every card and the article page are labeled as samples. Replace with real posts (or a CMS) later.
 */
export const CATEGORIES = [
  { id: 'career', label: 'Sales career advice' },
  { id: 'hiring', label: 'Hiring advice' },
  { id: 'compensation', label: 'Compensation' },
  { id: 'interview', label: 'Interview advice' },
  { id: 'leadership', label: 'Sales leadership' },
  { id: 'recruiting', label: 'Recruiting insights' },
  { id: 'market', label: 'Market observations' },
];

export const categoryLabel = (id) => CATEGORIES.find((category) => category.id === id)?.label ?? id;

export const ARTICLES = [
  {
    slug: 'how-to-know-when-an-ae-is-actually-good',
    title: 'How to Know When an AE Is Actually Good',
    category: 'hiring',
    featured: true,
    excerpt: 'Quota attainment is only part of the story. A practical look at the signals worth probing (territory, pipeline source, deal quality) before you trust a number.',
  },
  {
    slug: 'what-top-sales-candidates-look-for',
    title: 'What Top Sales Candidates Look For in Their Next Role',
    category: 'career',
    excerpt: 'Comp matters, but it’s rarely the whole decision. What strong reps weigh (product, manager, ramp, and path) when a new opportunity shows up.',
  },
  {
    slug: 'good-sales-hire-vs-great-one',
    title: 'The Difference Between a Good Sales Hire and a Great One',
    category: 'hiring',
    excerpt: 'Both can hit a number in the right conditions. What separates them is how they behave when conditions change.',
  },
  {
    slug: 'how-to-read-an-ote-range',
    title: 'How to Read an OTE Range Before You Say Yes',
    category: 'compensation',
    excerpt: 'Base, variable, accelerators, and attainment reality. A framework for understanding what a plan actually pays.',
  },
  {
    slug: 'interview-questions-that-reveal-how-a-rep-sells',
    title: 'Interview Questions That Reveal How a Rep Really Sells',
    category: 'interview',
    excerpt: 'Move past rehearsed answers. Questions that surface process, judgment, and self-awareness.',
  },
  {
    slug: 'first-90-days-of-a-new-sales-manager',
    title: 'The First 90 Days of a New Sales Manager',
    category: 'leadership',
    excerpt: 'Coaching cadence, pipeline inspection, and earning trust with reps who used to be your peers.',
  },
  {
    slug: 'why-relevant-introductions-beat-resume-volume',
    title: 'Why Relevant Introductions Beat Resume Volume',
    category: 'recruiting',
    excerpt: 'A short case for fewer, better conversations, and what it takes to make them happen.',
  },
  {
    slug: 'notes-on-the-startup-sales-hiring-market',
    title: 'Notes on the Startup Sales Hiring Market',
    category: 'market',
    excerpt: 'A running space for what we’re seeing across sales hiring at startups and growth-stage companies.',
  },
];
