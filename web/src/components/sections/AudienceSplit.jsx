import { Check } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Reveal from '../ui/Reveal.jsx';
import Flame from '../ui/Flame.jsx';

const TALENT_POINTS = ['Tell us what you want once', 'Get introduced only when there’s a fit', 'No recruiter spam, no black hole'];
const COMPANY_POINTS = ['Relevant talent, not endless resumes', 'Recruiters who understand sales roles', 'Introductions built around fit'];

function Points({ items }) {
  return (
    <ul className="split-card__points">
      {items.map((item) => (
        <li key={item}>
          <span className="split-card__check" aria-hidden="true">
            <Check size={14} strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Two-audience overview: one card per side of the marketplace. */
export default function AudienceSplit() {
  return (
    <div className="split">
      <Reveal as="article" className="split-card split-card--talent">
        <Flame className="split-card__flame" />
        <span className="eyebrow">For talent</span>
        <h3>
          Your next role, without <em>the noise.</em>
        </h3>
        <p className="split-card__lead">Build one profile. We introduce you to relevant companies when there’s a genuine fit, so you can stop endlessly applying.</p>
        <Points items={TALENT_POINTS} />
        <div className="split-card__cta">
          <Button to="/talent#join" arrow>
            Join the Talent Network
          </Button>
          <Button to="/talent" variant="ghost">
            Learn more
          </Button>
        </div>
      </Reveal>

      <Reveal as="article" className="split-card split-card--companies" delay={120}>
        <Flame className="split-card__flame" />
        <span className="eyebrow">For companies</span>
        <h3>
          Meet the salespeople <em>worth meeting.</em>
        </h3>
        <p className="split-card__lead">Great salespeople aren’t always applying. The Sales Floor creates a more direct path to the ones who fit what you’re hiring for.</p>
        <Points items={COMPANY_POINTS} />
        <div className="split-card__cta">
          <Button to="/companies#hire" variant="light" arrow>
            Hire Sales Talent
          </Button>
          <Button to="/companies" variant="ghost" className="btn--ghost-light">
            Learn more
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
