import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

/** Confirmation state. Moves focus to its heading so screen-reader users hear the result. */
export default function FormSuccess({ title, children, actions }) {
  const heading = useRef(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <div className="form-success" role="status">
      <span className="form-success__icon">
        <Check size={34} strokeWidth={3} aria-hidden="true" />
      </span>
      <h3 ref={heading} tabIndex={-1} className="form-success__title">
        {title}
      </h3>
      <div className="form-success__body">{children}</div>
      {actions && <div className="form-success__actions">{actions}</div>}
    </div>
  );
}
