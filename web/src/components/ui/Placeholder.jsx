import { Info } from 'lucide-react';

/**
 * Explicit "real content goes here" block. Used wherever the brief calls for
 * logos, testimonials, stories, or bios that don't exist yet — never fabricated.
 */
export default function Placeholder({ label, hint, className = '', children }) {
  return (
    <div className={`placeholder ${className}`.trim()}>
      <span className="placeholder__label">
        <Info size={14} aria-hidden="true" /> Placeholder
      </span>
      <p className="placeholder__title">{label}</p>
      {hint && <p className="placeholder__hint">{hint}</p>}
      {children}
    </div>
  );
}
