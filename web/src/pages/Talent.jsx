import { Lock, ShieldCheck } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta.js';
import Button from '../components/ui/Button.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import Badge from '../components/ui/Badge.jsx';
import CardStack from '../components/visuals/CardStack.jsx';
import RoleCard from '../components/sections/RoleCard.jsx';
import CandidateForm from '../components/forms/CandidateForm.jsx';
import { CORE_ROLES, EXPANDING_ROLES } from '../data/roles.js';
import { WHY_JOIN } from '../data/principles.js';

const AFTER_JOINING = [
  { title: 'We review your profile', body: 'A sales-focused recruiter looks at your background and what you told us you want.' },
  { title: 'We reach out when there’s a fit', body: 'No blasts. If something is relevant, we’ll contact you directly.' },
  { title: 'You decide what happens next', body: 'Every introduction is your call. You’re never obligated to move forward.' },
];

export default function Talent() {
  usePageMeta('For Sales Talent', 'Join The Sales Floor talent network. Tell us what you’re looking for and get introduced to relevant companies, without endless applications or recruiter spam.');

  return (
    <>
      {/* Hero */}
      <section className="page-hero" aria-labelledby="talent-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container page-hero__grid">
          <div className="page-hero__copy">
            <span className="eyebrow hero-in">For Talent</span>
            <h1 id="talent-title" className="hero-in" style={{ '--d': '80ms' }}>
              Your next role, without <em>the noise.</em>
            </h1>
            <p className="lead hero-in" style={{ '--d': '180ms' }}>
              The Sales Floor connects sales professionals with relevant companies and opportunities. Tell us what you’re looking for once, and we’ll introduce you when there’s a real fit.
            </p>
            <div className="page-hero__ctas hero-in" style={{ '--d': '280ms' }}>
              <Button to="/talent#join" size="lg" arrow>
                Join the Talent Network
              </Button>
              <Button to="/process" size="lg" variant="outline">
                See How It Works
              </Button>
            </div>
            <p className="page-hero__note hero-in" style={{ '--d': '360ms' }}>
              <ShieldCheck size={16} aria-hidden="true" /> Free to join. Takes about two minutes.
            </p>
          </div>
          <div className="page-hero__visual hero-in" style={{ '--d': '300ms' }}>
            <CardStack />
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="section" aria-labelledby="why-join-title">
        <div className="container">
          <SectionHead eyebrow="Why join" title={<span id="why-join-title">Stop applying. Start being <em>introduced.</em></span>} lead="The best sales roles rarely come from the fiftieth application. Here’s what changes when you join the network." />
          <div className="grid grid--3">
            {WHY_JOIN.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} as="article" delay={index * 80} className="card card--hover feature-card">
                  <span className="icon-tile">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Reveal>
              );
            })}
            <Reveal as="article" delay={WHY_JOIN.length * 80} className="card feature-card feature-card--cta">
              <h3>Ready when you are.</h3>
              <p>Build your profile once. We’ll take it from there.</p>
              <Button to="/talent#join" variant="light" arrow>
                Join the Talent Network
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="section section--soft" id="roles" aria-labelledby="roles-title">
        <div className="container">
          <SectionHead eyebrow="Roles" title={<span id="roles-title">The roles we recruit for.</span>} lead="Software sales at startups and growth-stage companies, across the core seats on a modern sales team." />
          <div className="grid grid--3">
            {CORE_ROLES.map((role, index) => (
              <RoleCard key={role.id} role={role} audience="talent" delay={index * 90} />
            ))}
          </div>

          <div className="roles-note">
            <Badge tone="outline">Expanding</Badge>
            <h3>On our radar</h3>
            <p>Roles we’re expanding toward. They aren’t part of our core offering yet, but if one of these is what you’re after, tell us in your profile.</p>
          </div>
          <div className="grid grid--4">
            {EXPANDING_ROLES.map((role, index) => (
              <RoleCard key={role.id} role={role} expanding delay={index * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section" id="join" aria-labelledby="join-title">
        <div className="container form-layout">
          <div className="form-layout__aside">
            <Reveal className="form-layout__sticky">
              <span className="eyebrow">Join the network</span>
              <h2 id="join-title">
                Tell us about yourself and <em>what you want.</em>
              </h2>
              <p className="lead">One profile, about two minutes. When there’s a genuine fit, we reach out directly.</p>

              <ol className="next-steps" aria-label="What happens after you join">
                {AFTER_JOINING.map((item, index) => (
                  <li key={item.title}>
                    <span className="next-steps__num" aria-hidden="true">
                      {index + 1}
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="form-layout__privacy">
                <Lock size={15} aria-hidden="true" /> Your resume is only shared with a company when you’re being considered for a role there.
              </p>
            </Reveal>
          </div>
          <div className="form-layout__main">
            <CandidateForm />
          </div>
        </div>
      </section>
    </>
  );
}
