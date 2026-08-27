/* content.js — ALL placeholder copy for the redesign in one place.
 *
 * >>> This is stand-in content. Replace every string here with the real thing
 *     before this redesign goes anywhere near production. <<<
 *
 * Shape is intentionally flat and boring so it's easy to hand off:
 *   logos         -> string (rendered as a wordmark) OR { name, img }
 *   placements[]  -> { name, role, company, note }
 *   testimonials[]-> { quote, name, title }
 *   team[]        -> { name, title, bio }
 *   pages.*       -> per-page hero / section copy
 *
 * ui.js reads this to fill [data-logos] and [data-carousel="..."] hosts.
 */
window.SITE_CONTENT = {
  tagline: 'Sales recruiting, run by people who carried a bag.',

  logos: [
    'Northwind', 'Apex Data', 'Cloudline', 'Brightpath', 'Meridian',
    'Ridgeline', 'Harbor AI', 'Fathom', 'Keystone', 'Beacon'
  ],

  placements: [
    { name: 'Jordan Reyes', role: 'SDR → Enterprise AE', company: 'Placed at Cloudline', note: 'B2B fintech' },
    { name: 'Priya Nair', role: 'BDR → Mid-Market AE', company: 'Placed at Northwind', note: 'Data infrastructure' },
    { name: 'Marcus Bell', role: 'AE → Team Lead', company: 'Placed at Meridian', note: 'Martech' },
    { name: 'Sofia Almeida', role: 'SDR → AE', company: 'Placed at Brightpath', note: 'Cybersecurity' },
    { name: 'Danielle Cho', role: 'Sales Manager', company: 'Placed at Harbor AI', note: 'AI tooling' },
    { name: 'Andre Willis', role: 'BDR → SDR Lead', company: 'Placed at Ridgeline', note: 'DevOps' },
    { name: 'Kaitlyn Ford', role: 'AE → Strategic AE', company: 'Placed at Keystone', note: 'HR tech' },
    { name: 'Sam Ortiz', role: 'SDR → AE', company: 'Placed at Beacon', note: 'Healthtech' }
  ],

  testimonials: [
    {
      quote: 'They sent three people and every one of them could have done the job. We hired the second. Fastest good hire we have made.',
      name: 'Dana Whitfield', title: 'VP Sales, Northwind'
    },
    {
      quote: 'The difference is they actually know what a strong SDR looks like, because they were strong SDRs. No resume spam, just people who fit.',
      name: 'Chris Okafor', title: 'Head of Marketing, Cloudline'
    },
    {
      quote: 'We were single-threaded on hiring and stuck for two months. One conversation with them and we had a pipeline of real candidates in a week.',
      name: 'Lena Farrow', title: 'Co-founder, Brightpath'
    },
    {
      quote: 'They treated our search like they were building their own team. Still check in months after the hire started.',
      name: 'Tomás Vega', title: 'CEO, Meridian'
    }
  ],

  team: [
    {
      name: 'Zach', title: 'Co-founder — Product & Systems',
      bio: 'Owns the platform behind the desk — the ranking and matching engine that decides which reps a company actually sees. Placeholder bio: two or three sentences on background and why this exists.'
    },
    {
      name: 'Nate Mills', title: 'Co-founder — Network & Standards',
      bio: 'Spent years breaking down what separates a good sales call from a forgettable one, in front of a large audience of reps. Placeholder bio: two or three sentences on background and the bar he holds candidates to.'
    }
  ],

  pages: {
    forTalent: {
      eyebrow: 'For talent',
      title: 'Your next sales role, without the recruiter runaround.',
      sub: 'Drop your details once. When a role genuinely fits your track record and what you want next, we reach out — with the hiring manager already interested.',
      cta: 'Apply to the pool',
      benefits: [
        { title: 'Real roles, not job-board noise', body: 'Every intro is a live req at a company we have talked to directly. If we call, someone is hiring.' },
        { title: 'Screened on what you actually did', body: 'We look at quota history, deal motion and trajectory — not keyword bingo. A human reads every profile.' },
        { title: 'Prep from people who sold', body: 'Positioning, story, comp expectations — worked through with someone who has sat in the seat.' },
        { title: 'One rung up, on purpose', body: 'We push for the title and comp your numbers support, not the one that is easiest to fill.' }
      ],
      steps: [
        { n: '01', title: 'Apply once', body: 'A short intake plus your resume. Two minutes.' },
        { n: '02', title: 'We review', body: 'A recruiter and our scoring pass read your history and place you against open roles.' },
        { n: '03', title: 'Warm intros', body: 'When something fits, you meet a hiring manager who already wants to talk.' }
      ]
    },
    forCompanies: {
      eyebrow: 'For companies',
      title: 'Hire B2B sales reps who have already done the job.',
      sub: 'We keep a screened pool of SDRs, AEs and sales managers and match against your specific req — role type, motion, industry, comp — so you interview three or four people, not thirty.',
      cta: 'Tell us what you’re hiring for',
      differentiators: [
        { title: 'Screened before you see them', body: 'Quota attainment, deal execution, sales-process discipline — scored on a consistent rubric so candidates are comparable.' },
        { title: 'Matched to the actual req', body: 'Our engine ranks the pool against your role, not against a generic "good rep" template.' },
        { title: 'Built by operators', body: 'The people running your search have carried a bag and built teams. They know what closes.' }
      ],
      steps: [
        { n: '01', title: 'Intake call', body: 'We learn the role, the motion, the team, and what "great" looks like for you.' },
        { n: '02', title: 'Matched shortlist', body: 'Three to four screened candidates ranked against your req, with notes on the fit.' },
        { n: '03', title: 'You hire one', body: 'We stay in the loop through offer and start, and check in after.' }
      ]
    },
    about: {
      eyebrow: 'About',
      title: 'A recruiting desk that respects the seat.',
      story: [
        'The Sales Floor started from a simple frustration: sales hiring is mostly resume roulette. Companies wade through hundreds of applicants; strong reps get ghosted; recruiters optimise for whatever is quickest to close.',
        'We built the opposite. A screened pool of B2B sales talent, a scoring rubric grounded in what actually predicts performance, and a matching engine that ranks that pool against a company’s specific req — so both sides spend their time on people who genuinely fit.',
        'Placeholder copy: expand this section with the real origin story, the standard candidates are held to, and where the business is headed (community, content, and more).'
      ]
    },
    home: {
      cta: {
        title: 'Two ways onto the floor.',
        body: 'Looking for your next role, or building a team? Start here — it takes about two minutes.'
      }
    }
  }
};
