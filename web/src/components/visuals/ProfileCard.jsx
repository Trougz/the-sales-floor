import Badge from '../ui/Badge.jsx';
import { MapPin, Wallet, Briefcase, Laptop } from 'lucide-react';

const ROLE_SHORT = { ae: 'AE', sdr: 'SDR', bdr: 'BDR' };

/** A clearly-labeled SAMPLE talent profile. Never rendered without the badge. */
export default function ProfileCard({ profile, className = '' }) {
  return (
    <article className={`profile-card ${className}`.trim()} aria-label={`Sample profile: ${profile.role}, ${profile.industry}`}>
      <header className="profile-card__top">
        <Badge tone="sample">Sample profile</Badge>
        <span className="profile-card__role-tag">{ROLE_SHORT[profile.roleId]}</span>
      </header>

      <h3 className="profile-card__role">{profile.role}</h3>
      <p className="profile-card__industry">{profile.industry}</p>

      <p className="profile-card__quota">
        <span className="profile-card__quota-number">{profile.quota}</span>
        <span className="profile-card__quota-label">quota attainment</span>
      </p>

      <dl className="profile-card__facts">
        <div>
          <dt>
            <Briefcase size={14} aria-hidden="true" /> Experience
          </dt>
          <dd>{profile.experience}</dd>
        </div>
        <div>
          <dt>
            <MapPin size={14} aria-hidden="true" /> Location
          </dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt>
            <Laptop size={14} aria-hidden="true" /> Work preference
          </dt>
          <dd>{profile.workStyle}</dd>
        </div>
        <div>
          <dt>
            <Wallet size={14} aria-hidden="true" /> Compensation
          </dt>
          <dd>{profile.comp}</dd>
        </div>
      </dl>

      <div className="profile-card__tools">
        <span className="profile-card__tools-label">Sales tools</span>
        <ul className="chips">
          {profile.tools.map((tool) => (
            <li key={tool} className="chip">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
