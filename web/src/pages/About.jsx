import usePageMeta from '../hooks/usePageMeta.js';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';
import FinalCta from '../components/sections/FinalCta.jsx';
import founderPhoto from '../assets/founder.jpg';
import { PHILOSOPHY } from '../data/principles.js';

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

      <section className="section" id="founder" aria-labelledby="founder-title">
        <div className="container founder">
          <Reveal className="founder__photo">
            <img src={founderPhoto} alt="Nate Mills, founder of The Sales Floor" width="402" height="503" />
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

      <FinalCta />
    </>
  );
}
