import usePageMeta from '../hooks/usePageMeta.js';
import Reveal from '../components/ui/Reveal.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import FlowDiagram from '../components/visuals/FlowDiagram.jsx';
import PathCards from '../components/sections/PathCards.jsx';
import { COMPANY_STEPS, TALENT_STEPS } from '../data/steps.js';

function Track({ id, label, title, steps, delay = 0 }) {
  return (
    <Reveal as="section" delay={delay} className="track" aria-labelledby={id}>
      <span className="eyebrow">{label}</span>
      <h3 id={id}>{title}</h3>
      <ol className="track__steps">
        {steps.map((step, index) => (
          <li key={step.title} className="track__step">
            <span className="track__num" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h4>{step.title}</h4>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

export default function Process() {
  usePageMeta('How It Works', 'The Sales Floor sits between sales talent and the companies hiring them. See how we make relevant introductions on both sides.');

  return (
    <>
      <section className="page-hero page-hero--center" aria-labelledby="process-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container">
          <div className="page-hero__inner">
            <span className="eyebrow hero-in">How it works</span>
            <h1 id="process-title" className="hero-in" style={{ '--d': '80ms' }}>
              Better introductions. <em>Better outcomes.</em>
            </h1>
            <p className="lead hero-in" style={{ '--d': '180ms' }}>
              The Sales Floor sits between the two sides of the sales hiring market. We work to understand what each side wants, then facilitate the introductions that make sense.
            </p>
          </div>
          <div className="hero-in" style={{ '--d': '300ms' }}>
            <FlowDiagram />
          </div>
        </div>
      </section>

      <section className="section section--soft" aria-labelledby="tracks-title">
        <div className="container">
          <SectionHead center eyebrow="Two sides, one process" title={<span id="tracks-title">Here’s what happens on each side.</span>} lead="The steps are simple, and each one exists to make the eventual introduction more relevant." />
          <div className="tracks">
            <Track id="track-talent" label="For talent" title="Get introduced when there’s a fit." steps={TALENT_STEPS} />
            <Track id="track-companies" label="For companies" title="Meet the people who fit." steps={COMPANY_STEPS} delay={120} />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="paths-title">
        <div className="container">
          <SectionHead center eyebrow="Get started" title={<span id="paths-title">Two paths. <em>One floor.</em></span>} lead="Pick the side you’re on." />
          <PathCards />
        </div>
      </section>
    </>
  );
}
