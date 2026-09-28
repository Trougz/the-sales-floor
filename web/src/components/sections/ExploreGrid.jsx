import { Link } from 'react-router';
import { ArrowUpRight, BookOpen, Building2, Flame as FlameIcon, MessageCircle, UserRound, Workflow } from 'lucide-react';
import Reveal from '../ui/Reveal.jsx';

const PATHS = [
  { to: '/talent', title: 'For Talent', body: 'Join the network and get introduced to relevant companies.', icon: UserRound, variant: 'talent', wide: true },
  { to: '/companies', title: 'For Companies', body: 'Tell us who you’re hiring and meet the salespeople who fit.', icon: Building2, variant: 'companies', wide: true },
  { to: '/process', title: 'How It Works', body: 'How we connect both sides of the sales hiring market.', icon: Workflow },
  { to: '/about', title: 'About', body: 'Built by people who understand sales.', icon: FlameIcon },
  { to: '/resources', title: 'Resources', body: 'Career advice, hiring insights, and market notes.', icon: BookOpen },
  { to: '/contact', title: 'Contact', body: 'Let’s make the introduction.', icon: MessageCircle },
];

/** Bento navigation into the six primary sections. */
export default function ExploreGrid() {
  return (
    <div className="explore">
      {PATHS.map((path, index) => {
        const Icon = path.icon;
        return (
          <Reveal key={path.to} delay={index * 70} className={`explore__cell${path.wide ? ' explore__cell--wide' : ''}`}>
            <Link to={path.to} className={`explore__card${path.variant ? ` explore__card--${path.variant}` : ''}`}>
              <span className="explore__icon">
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="explore__text">
                <span className="explore__title">{path.title}</span>
                <span className="explore__body">{path.body}</span>
              </span>
              <span className="explore__arrow" aria-hidden="true">
                <ArrowUpRight size={20} />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
