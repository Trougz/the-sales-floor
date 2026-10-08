import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router';
import usePageMeta from '../hooks/usePageMeta.js';
import Button from '../components/ui/Button.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import NetworkVisual from '../components/visuals/NetworkVisual.jsx';
import ProfileCard from '../components/visuals/ProfileCard.jsx';
import LogoStrip from '../components/sections/LogoStrip.jsx';
import RoleCard from '../components/sections/RoleCard.jsx';
import FaqSection from '../components/sections/FaqSection.jsx';
import FinalCta from '../components/sections/FinalCta.jsx';
import { CORE_ROLES } from '../data/roles.js';
import { SAMPLE_PROFILES } from '../data/profiles.js';

const HERO_PROOF = ['Free for sales talent', 'Sales-native recruiters', 'No recruiter spam'];
const SHOWCASE = [SAMPLE_PROFILES[0], SAMPLE_PROFILES[2], SAMPLE_PROFILES[4]];

export default function Home() {
  usePageMeta();

  return (
    <>
      {/* 1. Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__bg" aria-hidden="true" />
        <div className="container hero__inner">
          <span className="hero__eyebrow hero-in" style={{ '--d': '0ms' }}>
            A curated talent network for sales
          </span>
          <h1 id="hero-title" className="hero-in" style={{ '--d': '80ms' }}>
            The private network connecting proven salespeople with companies that are <em>actually hiring.</em>
          </h1>
          <p className="lead hero-in" style={{ '--d': '180ms' }}>
            The Sales Floor connects strong sales talent with companies looking to hire them. Tell us what you want and we make the introduction when there’s a real fit: no job board, no resume pile.
          </p>
          <div className="hero__ctas hero-in" style={{ '--d': '280ms' }}>
            <Button to="/talent" size="lg" arrow>
              I’m Sales Talent
            </Button>
            <Button to="/companies" size="lg" variant="dark" arrow>
              I’m Hiring
            </Button>
          </div>
          <ul className="hero__proof hero-in" style={{ '--d': '360ms' }}>
            {HERO_PROOF.map((item) => (
              <li key={item}>
                <Check size={16} strokeWidth={3} aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>

          <div className="hero__visual hero-in" style={{ '--d': '480ms' }}>
            <p className="sr-only">Illustration: sample sales talent profiles on the left and sample hiring companies on the right, connected through The Sales Floor in the middle.</p>
            <NetworkVisual />
          </div>
        </div>
      </section>

      {/* 2. Who we work with */}
      <LogoStrip />

      {/* 3. Talent network */}
      <section className="section" aria-labelledby="network-title">
        <div className="container">
          <SectionHead
            eyebrow="The talent network"
            title={<span id="network-title">A network of salespeople <em>worth knowing.</em></span>}
            lead="Every member tells us their role, experience, industry, compensation, location, and work style, so introductions start from what actually matters."
          />
          <div className="grid grid--3 profile-grid">
            {SHOWCASE.map((profile, index) => (
              <Reveal key={profile.id} delay={index * 100}>
                <ProfileCard profile={profile} />
              </Reveal>
            ))}
          </div>
          <Reveal className="network-note">
            <Link to="/talent" className="link-arrow">
              Explore the talent network <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 4. Roles */}
      <section className="section" aria-labelledby="roles-title">
        <div className="container">
          <SectionHead
            eyebrow="Roles"
            title={<span id="roles-title">The sales roles we recruit.</span>}
            lead="Focused on software sales at startups and growth-stage companies."
          />
          <div className="grid grid--3">
            {CORE_ROLES.map((role, index) => (
              <RoleCard key={role.id} role={role} delay={index * 90} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <FaqSection />

      {/* 6. Final CTA */}
      <FinalCta />
    </>
  );
}
