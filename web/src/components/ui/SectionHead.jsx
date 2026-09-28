import Reveal from './Reveal.jsx';

export default function SectionHead({ eyebrow, title, lead, center = false, as: Tag = 'h2', children }) {
  return (
    <Reveal className={`section-head${center ? ' section-head--center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Tag>{title}</Tag>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </Reveal>
  );
}
