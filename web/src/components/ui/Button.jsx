import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

/**
 * One button for every CTA.
 *  - `to`   → internal route (React Router <Link>)
 *  - `href` → external / mailto
 *  - neither → real <button> (defaults to type="button")
 * variants: primary | dark | outline | ghost | light   sizes: md | lg
 */
export default function Button({ to, href, variant = 'primary', size = 'md', arrow = false, className = '', children, ...rest }) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight className="btn__arrow" size={size === 'lg' ? 20 : 18} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
