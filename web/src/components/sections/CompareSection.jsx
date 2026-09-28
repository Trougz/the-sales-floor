import { Check, X } from 'lucide-react';
import Reveal from '../ui/Reveal.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import { COMPARISON } from '../../data/principles.js';

/** "Not another job board." — dark two-column comparison. */
export default function CompareSection({ id, title, lead, eyebrow = 'The difference' }) {
  return (
    <section className="section section--dark compare" id={id}>
      <div className="compare__glow" aria-hidden="true" />
      <div className="container">
        <SectionHead eyebrow={eyebrow} title={title} lead={lead} />
        <div className="compare__grid">
          <Reveal className="compare__col compare__col--usual">
            <h3>{COMPARISON.usual.title}</h3>
            <ul>
              {COMPARISON.usual.rows.map((row) => (
                <li key={row}>
                  <span className="compare__icon" aria-hidden="true">
                    <X size={16} strokeWidth={3} />
                  </span>
                  {row}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="compare__col compare__col--floor" delay={120}>
            <h3>{COMPARISON.floor.title}</h3>
            <ul>
              {COMPARISON.floor.rows.map((row) => (
                <li key={row}>
                  <span className="compare__icon" aria-hidden="true">
                    <Check size={16} strokeWidth={3} />
                  </span>
                  {row}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
