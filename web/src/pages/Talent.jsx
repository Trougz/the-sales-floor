import { ShieldCheck } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta.js';
import Button from '../components/ui/Button.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import CardStack from '../components/visuals/CardStack.jsx';
import RoleCard from '../components/sections/RoleCard.jsx';
import TalentFormLayout from '../components/sections/TalentFormLayout.jsx';
import { CORE_ROLES } from '../data/roles.js';
import { WHY_JOIN } from '../data/principles.js';

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
      <section className="section" id="roles" aria-labelledby="roles-title">
        <div className="container">
          <SectionHead eyebrow="Roles" title={<span id="roles-title">The roles we recruit for.</span>} lead="Software sales at startups and growth-stage companies, across the core seats on a modern sales team." />
          <div className="grid grid--3">
            {CORE_ROLES.map((role, index) => (
              <RoleCard key={role.id} role={role} audience="talent" delay={index * 90} />
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section" id="join" aria-labelledby="join-title">
        <TalentFormLayout />
      </section>
    </>
  );
}
