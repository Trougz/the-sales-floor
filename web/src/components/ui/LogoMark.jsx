/**
 * The funnel mark: three sliced bands (64 x 56). The top band is brand red; the lower two take the
 * surrounding text colour, so the same mark works on light and dark. Master artwork and outlined
 * lockups live in brand/logo/ (gitignored); this is the inline copy used by <Logo />.
 */
export default function LogoMark({ className = '', ...rest }) {
  return (
    <svg className={`logo-mark ${className}`.trim()} viewBox="0 0 64 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" {...rest}>
      <path className="logo-mark__top" d="M0 0H64L54.86 16H9.14Z" />
      <path className="logo-mark__body" d="M11.43 20H52.57L43.43 36H20.57Z" />
      <path className="logo-mark__body" d="M22.86 40H41.14L32 56Z" />
    </svg>
  );
}
