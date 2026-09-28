import { ArrowDown, Check } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { SAMPLE_PROFILES } from '../../data/profiles.js';

const REQUEST = [
  ['Seniority', 'Mid-market'],
  ['Industry', 'B2B SaaS'],
  ['Location', 'Remote'],
  ['Compensation', '$140k – $250k OTE'],
  ['Timeline', 'Within 30 days'],
];

const INTROS = [SAMPLE_PROFILES[0], SAMPLE_PROFILES[1]];

/** Companies hero visual: a sample hiring request flowing into sample introductions. Decorative. */
export default function RequestCard() {
  return (
    <div className="request-visual" aria-hidden="true">
      <div className="request-card">
        <Badge tone="sample">Sample hiring request</Badge>
        <h3>Account Executive</h3>
        <dl className="request-card__facts">
          {REQUEST.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="request-visual__arrow">
        <ArrowDown size={18} />
        <span>Matched from the network</span>
      </div>

      <ul className="request-intros">
        {INTROS.map((profile) => (
          <li key={profile.id} className="request-intro">
            <span className="request-intro__check">
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="request-intro__text">
              <strong>{profile.role}</strong>
              <span>
                {profile.industry} · {profile.experience} · {profile.workStyle}
              </span>
            </span>
            <Badge tone="sample">Sample</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
