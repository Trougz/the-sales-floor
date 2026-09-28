import usePageMeta from '../hooks/usePageMeta.js';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';
import FinalCta from '../components/sections/FinalCta.jsx';
import { ABOUT_PILLARS, PHILOSOPHY } from '../data/principles.js';

export default function About() {
  usePageMeta('About', 'The Sales Floor is a founder-led, sales-native recruiting network built to make better introductions between sales talent and modern sales organizations.');

  return (
    <>
      <section className="page-hero" aria-labelledby="about-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container">
          <div className="page-hero__inner">
            <span className="eyebrow hero-in">About</span>
            <h1 id="about-title" className="hero-in" style={{ '--d': '80ms' }}>
              Built by people who <em>understand sales.</em>
            </h1>
            <p className="lead hero-in" style={{ '--d': '180ms' }}>
              The Sales Floor is a curated network that connects strong sales talent with the startups and growth-stage companies hiring them, with sales-native recruiting and better introductions at the center.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="pillars-title">
        <div className="container">
          <SectionHead eyebrow="What we’re about" title={<span id="pillars-title">Five ideas behind the network.</span>} />
          <div className="pillars">
            {ABOUT_PILLARS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} as="article" delay={index * 80} className="card card--hover feature-card pillar">
                  <span className="icon-tile">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="founder" aria-labelledby="founder-title">
        <div className="container founder">
          <Reveal className="founder__photo" role="img" aria-label="Photo placeholder for Nate Mills">
            <span className="founder__initials" aria-hidden="true">
              NM
            </span>
            <span className="founder__photo-note">[Photo placeholder]</span>
          </Reveal>
          <Reveal className="founder__copy" delay={120}>
            <span className="eyebrow">Founder</span>
            <h2 id="founder-title">Nate Mills</h2>
            <p className="founder__role">Founder, The Sales Floor</p>
            <Placeholder
              label="[INSERT VERIFIED NATE MILLS BIO]"
              hint="Add a short bio using only verified information from The Sales Floor and publicly available sources. Nothing has been written here on purpose."
            />
          </Reveal>
        </div>
      </section>

      <section className="section section--dark philosophy" id="philosophy" aria-labelledby="philosophy-title">
        <div className="philosophy__glow" aria-hidden="true" />
        <div className="container philosophy__grid">
          <SectionHead eyebrow="Philosophy" title={<span id="philosophy-title">What we believe about <em>recruiting.</em></span>} lead="Five beliefs that shape who we introduce, and who we don’t." />
          <ol className="beliefs">
            {PHILOSOPHY.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 70} className="belief">
                <span className="belief__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="proof" aria-labelledby="proof-title">
        <div className="container">
          <SectionHead
            eyebrow="Social proof"
            title={<span id="proof-title">Proof, when it’s <em>real.</em></span>}
            lead="This is where verified logos, testimonials, and stories will live. Every block below is a placeholder until real, permissioned content is added."
          />

          <div className="proof">
            <Reveal as="section" className="proof__block" aria-labelledby="proof-logos">
              <h3 id="proof-logos">Client logos</h3>
              <ul className="proof__logos">
                <li className="proof__logo proof__logo--name">Pepper</li>
                <li className="proof__logo proof__logo--name">NOSO Labs</li>
                <li className="proof__logo proof__logo--empty">Client logo</li>
                <li className="proof__logo proof__logo--empty">Client logo</li>
              </ul>
              <p className="proof__hint">Pepper and NOSO Labs are shown as plain text. Swap in approved logo files.</p>
            </Reveal>

            <Reveal as="section" className="proof__block" delay={100} aria-labelledby="proof-testimonials">
              <h3 id="proof-testimonials">Testimonials</h3>
              <div className="proof__stack">
                <Placeholder label="[Testimonial placeholder]" hint="Add a verified quote with name, title, and company, and only with permission." />
                <Placeholder label="[Testimonial placeholder]" hint="Company-side or candidate-side." />
              </div>
            </Reveal>

            <Reveal as="section" className="proof__block" delay={200} aria-labelledby="proof-candidates">
              <h3 id="proof-candidates">Candidate stories</h3>
              <Placeholder label="[Candidate story placeholder]" hint="A real member’s experience joining the network, with their consent." />
            </Reveal>

            <Reveal as="section" className="proof__block" delay={300} aria-labelledby="proof-placements">
              <h3 id="proof-placements">Placement stories</h3>
              <Placeholder label="[Placement story placeholder]" hint="A real introduction that became a hire. Add only what both sides have approved." />
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
