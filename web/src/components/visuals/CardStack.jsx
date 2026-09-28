import { Check } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import ProfileCard from './ProfileCard.jsx';
import { SAMPLE_PROFILES } from '../../data/profiles.js';

/**
 * Talent hero visual: a sample profile, the preferences behind it, and the kind of
 * introduction it can lead to. Decorative, so hidden from assistive tech.
 */
export default function CardStack() {
  return (
    <div className="card-stack" aria-hidden="true">
      <div className="card-stack__glow" />

      <div className="card-stack__profile">
        <ProfileCard profile={SAMPLE_PROFILES[0]} />
      </div>

      <div className="card-stack__prefs">
        <span className="card-stack__prefs-label">What you told us</span>
        <ul className="chips">
          <li className="chip chip--red">Account Executive</li>
          <li className="chip">B2B SaaS</li>
          <li className="chip">Remote</li>
        </ul>
      </div>

      <div className="card-stack__intro">
        <span className="card-stack__intro-check">
          <Check size={16} strokeWidth={3} />
        </span>
        <span className="card-stack__intro-text">
          <strong>Relevant introduction</strong>
          <span>Growth-stage B2B SaaS is hiring an Account Executive.</span>
        </span>
        <Badge tone="sample">Sample</Badge>
      </div>
    </div>
  );
}
