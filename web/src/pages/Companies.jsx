import { Lock } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta.js';
import Button from '../components/ui/Button.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import RequestCard from '../components/visuals/RequestCard.jsx';
import RoleCard from '../components/sections/RoleCard.jsx';
import StepList from '../components/sections/StepList.jsx';
import CompanyForm from '../components/forms/CompanyForm.jsx';
import { CORE_ROLES, LEADERSHIP_ROLE } from '../data/roles.js';
import { COMPANY_PAGE_STEPS } from '../data/steps.js';

const COMPANY_ROLES = [...CORE_ROLES, LEADERSHIP_ROLE];

const INCLUDE = ['The role and seniority', 'Industry and experience you want', 'Compensation and location', 'Your hiring timeline'];

export default function Companies() {
  usePageMeta('For Companies', 'Hire sales talent through The Sales Floor. Skip the resume pile and meet relevant SDRs, BDRs, Account Executives, and sales leaders through a curated network.');

  return (
    <>
      {/* Hero */}
      <section className="page-hero" aria-labelledby="companies-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container page-hero__grid">
          <div className="page-hero__copy">
            <span className="eyebrow hero-in">For Companies</span>
            <h1 id="companies-title" className="hero-in" style={{ '--d': '80ms' }}>
              Meet the salespeople <em>worth meeting.</em>
            </h1>
            <p className="lead hero-in" style={{ '--d': '180ms' }}>
              Great salespeople aren’t always actively applying. The Sales Floor creates a more direct path to relevant talent, so you meet the people who fit instead of sorting through the ones who don’t.
            </p>
            <div className="page-hero__ctas hero-in" style={{ '--d': '280ms' }}>
              <Button to="/companies#hire" size="lg" arrow>
                Hire Sales Talent
              </Button>
              <Button to="/process" size="lg" variant="outline">
                See How It Works
              </Button>
            </div>
          </div>
          <div className="page-hero__visual hero-in" style={{ '--d': '300ms' }}>
            <RequestCard />
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="section section--dark problem" aria-labelledby="problem-title">
        <div className="problem__glow" aria-hidden="true" />
        <div className="container">
          <Reveal className="problem__inner">
            <span className="eyebrow">The problem</span>
            <h2 id="problem-title" className="problem__statement">
              Companies don’t need more resumes.
              <span> They need access to the <em>right salespeople.</em></span>
            </h2>
            <p className="lead">A bigger pile isn’t a better pool. The hard part of sales hiring is finding the few people who fit the role, the team, and the moment, and getting in front of them.</p>
          </Reveal>
        </div>
      </section>

      {/* How it helps */}
      <section className="section" aria-labelledby="helps-title">
        <div className="container">
          <SectionHead eyebrow="How The Sales Floor helps" title={<span id="helps-title">From your criteria to <em>the right introduction.</em></span>} lead="Three steps, and you stay in control of who you meet." />
          <StepList steps={COMPANY_PAGE_STEPS} />
        </div>
      </section>

      {/* Roles */}
      <section className="section section--soft" id="roles" aria-labelledby="roles-title">
        <div className="container">
          <SectionHead eyebrow="Roles" title={<span id="roles-title">The sales seats we help you fill.</span>} lead="From the first outbound rep to the leader who builds the team." />
          <div className="grid grid--4">
            {COMPANY_ROLES.map((role, index) => (
              <RoleCard key={role.id} role={role} audience="company" delay={index * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section" id="hire" aria-labelledby="hire-title">
        <div className="container form-layout">
          <div className="form-layout__aside">
            <Reveal className="form-layout__sticky">
              <span className="eyebrow">Hire sales talent</span>
              <h2 id="hire-title">
                Start with a few <em>details.</em>
              </h2>
              <p className="lead">Only the basics are required. The more you share, the sharper our first conversation.</p>
              <div className="include-list">
                <h3>Helpful to include</h3>
                <ul>
                  {INCLUDE.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="form-layout__privacy">
                <Lock size={15} aria-hidden="true" /> We’ll be in touch personally to talk through the profile.
              </p>
            </Reveal>
          </div>
          <div className="form-layout__main">
            <CompanyForm />
          </div>
        </div>
      </section>
    </>
  );
}
