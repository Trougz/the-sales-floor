import Button from '../ui/Button.jsx';
import Reveal from '../ui/Reveal.jsx';
import { CTA_PRIMARY, CTA_SECONDARY } from '../../data/navigation.js';

/** Closing conversion band shared by pages. Copy is overridable per page. */
export default function FinalCta({ title = 'The right introduction can change everything.', lead, primary = CTA_PRIMARY, secondary = CTA_SECONDARY }) {
  return (
    <section className="final-cta section section--dark" aria-labelledby="final-cta-title">
      <div className="container">
        <Reveal className="final-cta__inner">
          <h2 id="final-cta-title">{title}</h2>
          {lead && <p className="lead">{lead}</p>}
          <div className="final-cta__buttons">
            <Button to={primary.to} size="lg" arrow>
              {primary.label}
            </Button>
            <Button to={secondary.to} size="lg" variant="light">
              {secondary.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
