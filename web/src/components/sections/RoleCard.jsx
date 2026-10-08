import Badge from '../ui/Badge.jsx';
import Reveal from '../ui/Reveal.jsx';

/** Role tile. `audience` picks the copy (talent vs company). */
export default function RoleCard({ role, audience = 'talent', delay = 0 }) {
  const Icon = role.icon;
  return (
    <Reveal as="article" delay={delay} className="card card--hover role-card">
      <div className="role-card__top">
        <span className="icon-tile">
          <Icon size={24} aria-hidden="true" />
        </span>
        <Badge tone="red">{role.short}</Badge>
      </div>
      <h3>{role.title}</h3>
      <p className="role-card__body">{role[audience]}</p>
      {role.skills && (
        <ul className="chips role-card__skills">
          {role.skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}
