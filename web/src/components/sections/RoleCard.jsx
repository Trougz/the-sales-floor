import Badge from '../ui/Badge.jsx';
import Reveal from '../ui/Reveal.jsx';

/** Role tile. `audience` picks the copy (talent vs company); `expanding` marks unconfirmed/future roles. */
export default function RoleCard({ role, audience = 'talent', expanding = false, delay = 0 }) {
  const Icon = role.icon;
  const body = expanding ? role.blurb : role[audience];
  return (
    <Reveal as="article" delay={delay} className={`card card--hover role-card${expanding ? ' role-card--expanding' : ''}`}>
      <div className="role-card__top">
        <span className="icon-tile">
          <Icon size={24} aria-hidden="true" />
        </span>
        {expanding ? <Badge tone="outline">Expanding</Badge> : <Badge tone="red">{role.short}</Badge>}
      </div>
      <h3>{role.title}</h3>
      <p className="role-card__body">{body}</p>
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
