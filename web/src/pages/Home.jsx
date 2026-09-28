import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router';
import usePageMeta from '../hooks/usePageMeta.js';
import Button from '../components/ui/Button.jsx';
import Flame from '../components/ui/Flame.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import Badge from '../components/ui/Badge.jsx';
import NetworkVisual from '../components/visuals/NetworkVisual.jsx';
import ProfileCard from '../components/visuals/ProfileCard.jsx';
import LogoStrip from '../components/sections/LogoStrip.jsx';
import AudienceSplit from '../components/sections/AudienceSplit.jsx';
import HowItWorksTabs from '../components/sections/HowItWorksTabs.jsx';
import RoleCard from '../components/sections/RoleCard.jsx';
import CompareSection from '../components/sections/CompareSection.jsx';
import ExploreGrid from '../components/sections/ExploreGrid.jsx';
import ArticleCard from '../components/sections/ArticleCard.jsx';
import FaqSection from '../components/sections/FaqSection.jsx';
import FinalCta from '../components/sections/FinalCta.jsx';
import { CORE_ROLES, EXPANDING_ROLES } from '../data/roles.js';
import { SAMPLE_PROFILES } from '../data/profiles.js';
import { ARTICLES } from '../data/articles.js';

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
            <Flame /> A curated talent network for sales
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
            <p className="hero__caption">Sample profiles and companies, shown for illustration only.</p>
          </div>
        </div>
      </section>

      {/* 2. Who we work with */}
      <LogoStrip />

      {/* 3. Two sides */}
      <section className="section" aria-labelledby="sides-title">
        <div className="container">
          <SectionHead
            eyebrow="One floor, two sides"
            title={<span id="sides-title">Built for the people who sell and the people who hire them.</span>}
            lead="Sales talent shouldn’t have to chase every posting, and companies shouldn’t have to dig through every resume. We sit in the middle and make it relevant."
          />
          <AudienceSplit />
        </div>
      </section>

      {/* 4. Talent network */}
      <section className="section section--soft" aria-labelledby="network-title">
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
            <Badge tone="sample">Sample</Badge>
            <p>These are illustrative sample profiles, not real candidates.</p>
            <Link to="/talent#network" className="link-arrow">
              Explore the talent network <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5. How it works */}
      <section className="section" aria-labelledby="hiw-title">
        <div className="container">
          <SectionHead
            center
            eyebrow="How it works"
            title={<span id="hiw-title">Better introductions, in four steps.</span>}
            lead="The same simple idea, from either side of the table."
          />
          <HowItWorksTabs />
        </div>
      </section>

      {/* 6. Roles */}
      <section className="section section--soft" aria-labelledby="roles-title">
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
          <Reveal className="roles-inline">
            <span className="roles-inline__label">
              <Badge tone="outline">Expanding</Badge> Also growing into
            </span>
            <ul className="chips">
              {EXPANDING_ROLES.map((role) => (
                <li key={role.id} className="chip">
                  {role.title}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 7. Not another job board */}
      <CompareSection id="difference" eyebrow="The difference" title={<>Not another job board. <em>A better way to meet.</em></>} lead="The Sales Floor is a curated network, not a feed of postings or a stack of resumes." />

      {/* 8. Explore */}
      <section className="section" aria-labelledby="explore-title">
        <div className="container">
          <SectionHead
            eyebrow="Explore"
            title={<span id="explore-title">Find your way around the floor.</span>}
            lead="Whether you’re selling or hiring, here’s where to start."
          />
          <ExploreGrid />
        </div>
      </section>

      {/* 9. Insights */}
      <section className="section section--soft" aria-labelledby="insights-title">
        <div className="container">
          <div className="section-split">
            <SectionHead eyebrow="Resources" title={<span id="insights-title">From the floor.</span>} lead="Advice for sales careers and sales hiring. Sample content shown while the hub is being built." />
            <Reveal>
              <Link to="/resources" className="link-arrow">
                Browse resources <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
          <div className="grid grid--3">
            {ARTICLES.slice(1, 4).map((article, index) => (
              <ArticleCard key={article.slug} article={article} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <FaqSection />

      {/* 11. Final CTA */}
      <FinalCta />
    </>
  );
}
