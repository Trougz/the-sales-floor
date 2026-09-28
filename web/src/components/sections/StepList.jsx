import Reveal from '../ui/Reveal.jsx';

/**
 * Numbered process steps. Desktop: a row with a connecting line.
 * Mobile: a vertical timeline. `tone="dark"` for dark sections.
 */
export default function StepList({ steps, tone = 'light', columns }) {
  return (
    <ol className={`steps steps--${tone}`} style={{ '--steps': columns ?? steps.length }}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <Reveal as="li" key={step.title} className="step" delay={index * 90}>
            <span className="step__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="step__marker" aria-hidden="true">
              {Icon ? <Icon size={20} /> : index + 1}
            </span>
            <h3 className="step__title">{step.title}</h3>
            <p className="step__body">{step.body}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}
