import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Flame from '../ui/Flame.jsx';
import useMediaQuery from '../../hooks/useMediaQuery.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';
import { SAMPLE_COMPANIES, SAMPLE_PROFILES } from '../../data/profiles.js';

/** Row centers (in % of the stage) — must line up with the 3 equal grid rows in CSS. */
const ROW_Y = [15.5, 50, 84.5];

// AE ↔ AE, SDR ↔ SDR, BDR ↔ BDR: each row pairs a talent profile with a company hiring that role.
const TALENT = [SAMPLE_PROFILES[0], SAMPLE_PROFILES[2], SAMPLE_PROFILES[4]];

const SHORT_TITLE = { ae: 'Account Executive', sdr: 'SDR', bdr: 'BDR' };

const leftPath = (y) => `M18 ${y} C 34 ${y}, 40 50, 50 50`;
const rightPath = (y) => `M50 50 C 60 50, 66 ${y}, 82 ${y}`;

/**
 * Hero illustration: SALES TALENT → THE SALES FLOOR → COMPANIES.
 * Decorative (aria-hidden) — the sample cards are illustrative, and a sentence
 * for assistive tech sits outside the visual. One pairing is highlighted at a time
 * to suggest an introduction being made.
 */
export default function NetworkVisual() {
  const reduced = useReducedMotion();
  const compact = useMediaQuery('(max-width: 899px)'); // the third pairing is hidden on small screens
  const visibleRows = compact ? 2 : ROW_Y.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    const timer = setInterval(() => setActive((i) => (i + 1) % visibleRows), 2800);
    return () => clearInterval(timer);
  }, [reduced, visibleRows]);

  return (
    <div className="network" aria-hidden="true">
      <div className="network__stage">
        <svg className="network__lines" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
          {ROW_Y.map((y, i) => (
            <g key={y} className={i === active ? 'is-active' : undefined}>
              <path className="net-line net-line--base" d={leftPath(y)} />
              <path className="net-line net-line--flow" d={leftPath(y)} />
              <path className="net-line net-line--base" d={rightPath(y)} />
              <path className="net-line net-line--flow" d={rightPath(y)} />
            </g>
          ))}
        </svg>

        <div className="network__col network__col--talent">
          <span className="network__label">Sales talent</span>
          {TALENT.map((profile, i) => (
            <div key={profile.id} className={`net-card net-card--talent${i === active ? ' is-active' : ''}`} style={{ '--float-delay': `${i * -1.4}s` }}>
              <div className="net-card__row">
                <span className="net-card__title">{SHORT_TITLE[profile.roleId]}</span>
                <span className="net-card__sample">Sample</span>
              </div>
              <p className="net-card__meta">
                {profile.industry} · {profile.experience}
              </p>
              <div className="net-card__row net-card__row--tags">
                <span className="chip chip--red">{profile.quota} quota</span>
                <span className="chip">{profile.workStyle}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="network__hub">
          <div className="network__orb">
            <span className="network__ring network__ring--1" />
            <span className="network__ring network__ring--2" />
            <div className="network__core">
              <Flame />
            </div>
          </div>
          <p className="network__hub-title">The Sales Floor</p>
          <p className="network__hub-sub">Curated introductions</p>
        </div>

        <div className="network__col network__col--companies">
          <span className="network__label">Companies</span>
          {SAMPLE_COMPANIES.map((company, i) => (
            <div key={company.id} className={`net-card net-card--company${i === active ? ' is-active' : ''}`} style={{ '--float-delay': `${i * -1.1 - 0.6}s` }}>
              <div className="net-card__row">
                <span className="net-card__title">{company.hiring}</span>
                <span className="net-card__sample">Sample</span>
              </div>
              <p className="net-card__meta">Hiring · {company.label}</p>
              <div className="net-card__row net-card__row--tags">
                {company.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="net-card__match">
                <Check size={13} strokeWidth={3} /> Relevant introduction
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
