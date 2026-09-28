import { Briefcase, UserRound } from 'lucide-react';
import Button from '../ui/Button.jsx';
import Reveal from '../ui/Reveal.jsx';

/** The two-audience chooser ("I'm Sales Talent" / "I'm Hiring"). Used on Contact and How It Works. */
export default function PathCards({
  talent = { desc: 'I’m interested in joining The Sales Floor.', cta: 'Join the Talent Network', to: '/talent#join' },
  hiring = { desc: 'I’m looking for sales talent.', cta: 'Hire Sales Talent', to: '/companies#hire' },
}) {
  return (
    <div className="path-cards">
      <Reveal className="path-card path-card--talent">
        <span className="icon-tile">
          <UserRound size={26} aria-hidden="true" />
        </span>
        <h3>I’m Sales Talent</h3>
        <p>{talent.desc}</p>
        <Button to={talent.to} arrow>
          {talent.cta}
        </Button>
      </Reveal>
      <Reveal className="path-card path-card--hiring" delay={100}>
        <span className="icon-tile">
          <Briefcase size={26} aria-hidden="true" />
        </span>
        <h3>I’m Hiring</h3>
        <p>{hiring.desc}</p>
        <Button to={hiring.to} variant="light" arrow>
          {hiring.cta}
        </Button>
      </Reveal>
    </div>
  );
}

