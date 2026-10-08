/** The flame: a decorative brand accent (hero eyebrow, network hub, flow diagram). Not the logo — that is <LogoMark /> (the funnel). Hand-drawn path carried over from the live site. */
export default function Flame({ className = '', ...rest }) {
  return (
    <svg className={`flame ${className}`.trim()} viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path d="M20 2C20 12 7 15 7 28C7 38 13 46 21 50C17 44 15 37 19 30C21 34 25 36 27 32C29 39 34 41 34 32C34 24 27 20 27 12C27 19 23 19 23 14C23 7 20 6 20 2Z" />
    </svg>
  );
}
